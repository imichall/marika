import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

interface Contact {
  id: string
  group_name: string
  address: string | null
  ico: string | null
  dic: string | null
  email: string | null
  bank_account: string | null
  created_at: string
  updated_at: string
}

export const useContacts = () => {
  const contacts = ref<Contact[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const supabase = useSupabaseClient()

  const fetchContacts = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('contacts')
        .select('id, group_name, address, ico, dic, email, bank_account, created_at, updated_at')
        .order('group_name')

      if (err) throw err

      contacts.value = data?.map(item => ({
        id: String(item.id),
        group_name: String(item.group_name),
        address: item.address ? String(item.address) : null,
        ico: item.ico ? String(item.ico) : null,
        dic: item.dic ? String(item.dic) : null,
        email: item.email ? String(item.email) : null,
        bank_account: item.bank_account ? String(item.bank_account) : null,
        created_at: String(item.created_at),
        updated_at: String(item.updated_at)
      })) || []
    } catch (err: any) {
      console.error('Error fetching contacts:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const updateContact = async (id: string, data: Partial<Contact>) => {
    try {
      loading.value = true
      error.value = null

      // Get current user for audit
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) throw new Error('User not authenticated')

      // Get contact data before update for audit
      const { data: oldData } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single()

      const { data: updatedContact, error: err } = await supabase
        .from('contacts')
        .update(data)
        .match({ id })
        .select()
        .single()

      if (err) throw err

      if (!updatedContact) {
        throw new Error('Kontakt nebyl nalezen')
      }

      // Create audit log
      if (oldData) {
        await supabase.rpc('create_audit_log', {
          p_user_email: currentUser.email,
          p_section: 'contacts',
          p_action: 'update',
          p_entity_id: id,
          p_details: {
            group_name: oldData.group_name,
            changes: Object.keys(data),
            old_values: Object.fromEntries(
              Object.keys(data).map(key => [key, oldData[key]])
            ),
            new_values: Object.fromEntries(
              Object.keys(data).map(key => [key, updatedContact[key]])
            )
          }
        })
      }

      // Aktualizujeme lokální stav
      const index = contacts.value.findIndex(c => c.id === id)
      if (index !== -1) {
        contacts.value[index] = { ...contacts.value[index], ...updatedContact }
      }

      return updatedContact
    } catch (err: any) {
      console.error('Error updating contact:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const addContact = async (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      loading.value = true
      error.value = null

      // Get current user for audit
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) throw new Error('User not authenticated')

      const now = new Date().toISOString()
      const contactData = {
        ...data,
        created_at: now,
        updated_at: now
      }

      const { data: newData, error: err } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single()

      if (err) throw err

      if (!newData) {
        throw new Error('Kontakt nebyl vytvořen')
      }

      // Create audit log
      await supabase.rpc('create_audit_log', {
        p_user_email: currentUser.email,
        p_section: 'contacts',
        p_action: 'create',
        p_entity_id: newData.id,
        p_details: {
          group_name: newData.group_name,
          contact_data: {
            address: newData.address,
            ico: newData.ico,
            dic: newData.dic,
            email: newData.email,
            bank_account: newData.bank_account
          }
        }
      })

      const contact: Contact = {
        id: String(newData.id),
        group_name: String(newData.group_name),
        address: newData.address ? String(newData.address) : null,
        ico: newData.ico ? String(newData.ico) : null,
        dic: newData.dic ? String(newData.dic) : null,
        email: newData.email ? String(newData.email) : null,
        bank_account: newData.bank_account ? String(newData.bank_account) : null,
        created_at: String(newData.created_at),
        updated_at: String(newData.updated_at)
      }

      contacts.value.push(contact)
      return contact
    } catch (err: any) {
      console.error('Error adding contact:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteContact = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      // Get current user for audit
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) throw new Error('User not authenticated')

      // Get contact data before deletion for audit
      const { data: contactData } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single()

      const { error: err } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (err) throw err

      // Create audit log
      if (contactData) {
        await supabase.rpc('create_audit_log', {
          p_user_email: currentUser.email,
          p_section: 'contacts',
          p_action: 'delete',
          p_entity_id: id,
          p_details: {
            group_name: contactData.group_name,
            deleted_data: {
              address: contactData.address,
              ico: contactData.ico,
              dic: contactData.dic,
              email: contactData.email,
              bank_account: contactData.bank_account
            }
          }
        })
      }

      contacts.value = contacts.value.filter(c => c.id !== id)
    } catch (err: any) {
      console.error('Error deleting contact:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    updateContact,
    addContact,
    deleteContact
  }
}