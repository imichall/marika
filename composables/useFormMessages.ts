import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

interface FormMessage {
  id: string
  email: string
  name: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  is_testimonial: boolean
  created_at: string
  updated_at: string
}

export const useFormMessages = () => {
  const supabase = useSupabaseClient()
  const messages = ref<FormMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Funkce pro vytvoření SQL záznamu
  const createTestimonialSql = (message: FormMessage) => {
    // Escapování apostrofů v textu
    const escapedText = message.message.replace(/'/g, "''");
    const escapedEmail = message.email.replace(/'/g, "''");

    // Vytvoření SQL příkazu ve stejném formátu jako v testimonials_rows.sql
    return `INSERT INTO "public"."testimonials" ("id", "author", "text", "source", "created_at") VALUES (DEFAULT, '${escapedEmail}', '${escapedText}', '', '${new Date().toISOString()}');`
  }

  // Funkce pro přidání záznamu do SQL souboru
  const appendToSqlFile = async (sql: string) => {
    try {
      const response = await fetch('/api/append-testimonial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      });

      if (!response.ok) {
        throw new Error('Failed to append to SQL file');
      }
    } catch (err) {
      console.error('Error appending to SQL file:', err);
      throw err;
    }
  }

  // Načtení všech zpráv (pro admin)
  const fetchAllMessages = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('form_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      messages.value = data
    } catch (err) {
      console.error('Error fetching messages:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  // Přidání nové zprávy
  const addMessage = async (messageData: { email: string; name: string; message: string; is_testimonial?: boolean }) => {
    try {
      const { data, error: err } = await supabase
        .from('form_messages')
        .insert([{ ...messageData, status: 'pending' }])
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err) {
      console.error('Error adding message:', err)
      throw err
    }
  }

  // Aktualizace zprávy
  const updateMessage = async (id: string, messageData: Partial<FormMessage>) => {
    try {
      // Get current user for audit
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) throw new Error('User not authenticated')

      // Get message data before update for audit
      const { data: oldData } = await supabase
        .from('form_messages')
        .select('*')
        .eq('id', id)
        .single()

      const { data, error: err } = await supabase
        .from('form_messages')
        .update(messageData)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      // Create audit log
      if (oldData) {
        await supabase.rpc('create_audit_log', {
          p_user_email: currentUser.email,
          p_section: 'form_messages',
          p_action: 'update',
          p_entity_id: id,
          p_details: {
            email: oldData.email,
            changes: Object.keys(messageData),
            old_values: Object.fromEntries(
              Object.keys(messageData).map(key => [key, oldData[key]])
            ),
            new_values: Object.fromEntries(
              Object.keys(messageData).map(key => [key, data[key]])
            )
          }
        })
      }

      return data
    } catch (err) {
      console.error('Error updating message:', err)
      throw err
    }
  }

  // Smazání zprávy
  const deleteMessage = async (id: string) => {
    try {
      // Get current user for audit
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) throw new Error('User not authenticated')

      // Nejprve získáme data zprávy
      const { data: message, error: messageError } = await supabase
        .from('form_messages')
        .select('*')
        .eq('id', id)
        .single();

      if (messageError) throw messageError;

      // Vytvoření auditního záznamu před smazáním
      await supabase.rpc('create_audit_log', {
        p_user_email: currentUser.email,
        p_section: 'form_messages',
        p_action: 'delete',
        p_entity_id: id,
        p_details: { email: message.email, message: message.message }
      });

      // Pokud je zpráva schválená jako reference, smažeme ji i z testimonials
      if (message.is_testimonial) {
        const { error: testimonialError } = await supabase
          .from('testimonials')
          .delete()
          .eq('text', message.message)
          .eq('author', message.email);

        if (testimonialError) throw testimonialError;
      }

      // Smažeme zprávu z form_messages
      const { error: deleteError } = await supabase
        .from('form_messages')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      return true;
    } catch (err) {
      console.error('Error deleting message:', err);
      throw err;
    }
  }

  // Změna stavu zprávy
  const updateMessageStatus = async (id: string, status: FormMessage['status']) => {
    try {
      // Get current user for audit
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) throw new Error('User not authenticated')

      // Nejprve získáme data zprávy pro audit
      const { data: message, error: messageError } = await supabase
        .from('form_messages')
        .select('*')
        .eq('id', id)
        .single();

      if (messageError) throw messageError;

      // Aktualizace statusu
      const { data: updatedMessage, error: updateError } = await supabase
        .from('form_messages')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Vytvoření auditního záznamu
      await supabase.rpc('create_audit_log', {
        p_user_email: currentUser.email,
        p_section: 'form_messages',
        p_action: status === 'approved' ? 'approve' : 'reject',
        p_entity_id: id,
        p_details: {
          email: message.email,
          message: message.message,
          previous_status: message.status,
          new_status: status
        }
      });

      return updatedMessage;
    } catch (err) {
      console.error('Error updating message status:', err);
      throw err;
    }
  }

  // Schválení zprávy jako reference
  const approveAsTestimonial = async (id: string) => {
    try {
      // Get current user for audit
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) throw new Error('User not authenticated')

      // Nejprve získáme data zprávy
      const { data: message, error: messageError } = await supabase
        .from('form_messages')
        .select('*')
        .eq('id', id)
        .single();

      if (messageError) throw messageError;

      // Vytvoříme nový záznam v tabulce testimonials
      const { data: testimonialData, error: testimonialError } = await supabase
        .from('testimonials')
        .insert([{
          text: message.message,
          author: message.email,
          source: '',
          status: 'approved'
        }])
        .select()
        .single();

      if (testimonialError) {
        console.error('Error creating testimonial:', testimonialError);
        throw testimonialError;
      }

      if (!testimonialData) {
        throw new Error('Failed to create testimonial record');
      }

      // Aktualizujeme status a is_testimonial v původní zprávě
      const { error: updateError } = await supabase
        .from('form_messages')
        .update({
          status: 'approved',
          is_testimonial: true
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Vytvoření auditního záznamu
      await supabase.rpc('create_audit_log', {
        p_user_email: currentUser.email,
        p_section: 'form_messages',
        p_action: 'approve',
        p_entity_id: id,
        p_details: {
          email: message.email,
          message: message.message,
          approved_as_testimonial: true,
          testimonial_id: testimonialData.id
        }
      });

      return true;
    } catch (err) {
      console.error('Error approving as testimonial:', err);
      throw err;
    }
  }

  return {
    messages,
    loading,
    error,
    fetchAllMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    updateMessageStatus,
    approveAsTestimonial,
  }
}