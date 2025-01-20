import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

interface Contact {
  id: string
  group_name: string
  address: string | null
  ico: string | null
  dic: string | null
  email: string | null
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
        .select('*')
        .order('group_name')

      if (err) throw err

      contacts.value = data
    } catch (err: any) {
      console.error('Error fetching contacts:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const updateContact = async (id: string, data: Partial<Contact>) => {
    try {
      const { data: updatedContact, error: err } = await supabase
        .from('contacts')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      // Aktualizujeme lokální stav
      const index = contacts.value.findIndex(c => c.id === id)
      if (index !== -1) {
        contacts.value[index] = { ...contacts.value[index], ...updatedContact }
      }

      return updatedContact
    } catch (err: any) {
      console.error('Error updating contact:', err)
      throw err
    }
  }

  const addContact = async (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newContact, error: err } = await supabase
        .from('contacts')
        .insert([data])
        .select()
        .single()

      if (err) throw err

      contacts.value.push(newContact)
      return newContact
    } catch (err: any) {
      console.error('Error adding contact:', err)
      throw err
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (err) throw err

      // Aktualizujeme lokální stav
      contacts.value = contacts.value.filter(c => c.id !== id)
    } catch (err: any) {
      console.error('Error deleting contact:', err)
      throw err
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