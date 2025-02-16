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

interface EmailLogsOptions {
  page?: Ref<number>
  itemsPerPage?: number
  onTotalChange?: (total: number) => void
}

export function useEmailLogs(options: EmailLogsOptions = {}) {
  const supabase = useSupabaseClient()
  const logs = ref<EmailLog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Načtení všech email logů
  const fetchEmailLogs = async () => {
    loading.value = true
    error.value = null

    try {
      // Nejdřív získáme celkový počet emailů
      const countQuery = await supabase
        .from('email_logs')
        .select('id', { count: 'exact', head: true })

      if (countQuery.error) throw countQuery.error

      // Informujeme o celkovém počtu
      if (options.onTotalChange) {
        options.onTotalChange(countQuery.count || 0)
      }

      // Pak načteme stránku
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })

      // Přidáme stránkování, pokud je nastaveno
      if (options.page && options.itemsPerPage) {
        const from = (options.page.value - 1) * options.itemsPerPage
        const to = from + options.itemsPerPage - 1
        query = query.range(from, to)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      logs.value = data || []
    } catch (err) {
      console.error('Error fetching email logs:', err)
      error.value = err.message
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