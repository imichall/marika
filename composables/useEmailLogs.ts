import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

interface EmailLog {
  id: string
  recipient: string
  subject: string
  body: string
  status: 'pending' | 'sent' | 'failed'
  error_message?: string
  created_at: string
  sent_at?: string
}

export const useEmailLogs = () => {
  const supabase = useSupabaseClient()
  const logs = ref<EmailLog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Načtení všech email logů
  const fetchEmailLogs = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      logs.value = data
    } catch (err) {
      console.error('Error fetching email logs:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  // Získání stavu emailu podle ID
  const getEmailStatus = async (id: string) => {
    try {
      const { data, error: err } = await supabase
        .from('email_logs')
        .select('status, error_message')
        .eq('id', id)
        .single()

      if (err) throw err
      return data
    } catch (err) {
      console.error('Error getting email status:', err)
      throw err
    }
  }

  return {
    logs,
    loading,
    error,
    fetchEmailLogs,
    getEmailStatus
  }
}