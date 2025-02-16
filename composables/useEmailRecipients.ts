import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

interface EmailRecipient {
  id: string
  email: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function useEmailRecipients() {
  const supabase = useSupabaseClient()
  const recipients = ref<EmailRecipient[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Načtení všech příjemců
  const fetchRecipients = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('email_recipients')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      recipients.value = data || []
    } catch (err) {
      console.error('Error fetching recipients:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  // Přidání nového příjemce
  const addRecipient = async (recipientData: { email: string; name: string }) => {
    try {
      const { data, error: err } = await supabase
        .from('email_recipients')
        .insert([{ ...recipientData, is_active: true }])
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err) {
      console.error('Error adding recipient:', err)
      throw err
    }
  }

  // Aktualizace příjemce
  const updateRecipient = async (id: string, recipientData: Partial<EmailRecipient>) => {
    try {
      const { data, error: err } = await supabase
        .from('email_recipients')
        .update(recipientData)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err) {
      console.error('Error updating recipient:', err)
      throw err
    }
  }

  // Smazání příjemce
  const deleteRecipient = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('email_recipients')
        .delete()
        .eq('id', id)

      if (err) throw err
      return true
    } catch (err) {
      console.error('Error deleting recipient:', err)
      throw err
    }
  }

  // Změna stavu aktivace příjemce
  const toggleRecipientStatus = async (id: string, isActive: boolean) => {
    try {
      const { data, error: err } = await supabase
        .from('email_recipients')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err) {
      console.error('Error toggling recipient status:', err)
      throw err
    }
  }

  return {
    recipients,
    loading,
    error,
    fetchRecipients,
    addRecipient,
    updateRecipient,
    deleteRecipient,
    toggleRecipientStatus,
  }
}