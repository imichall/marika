import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

export interface AuditLog {
  id: string
  user_email: string
  section: string
  action: string
  entity_id: string | null
  details: any
  created_at: string
}

export interface AuditConfig {
  id: string
  section: string
  action: string
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export const useAuditLogs = () => {
  const supabase = useSupabaseClient()
  const logs = ref<AuditLog[]>([])
  const config = ref<AuditConfig[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Načtení auditních záznamů
  const fetchLogs = async (filters?: {
    section?: string
    action?: string
    user_email?: string
    from_date?: Date
    to_date?: Date
  }) => {
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.section) {
        query = query.eq('section', filters.section)
      }
      if (filters?.action) {
        query = query.eq('action', filters.action)
      }
      if (filters?.user_email) {
        query = query.eq('user_email', filters.user_email)
      }
      if (filters?.from_date) {
        query = query.gte('created_at', filters.from_date.toISOString())
      }
      if (filters?.to_date) {
        query = query.lte('created_at', filters.to_date.toISOString())
      }

      const { data, error: err } = await query

      if (err) throw err
      logs.value = data || []
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  // Načtení konfigurace auditování
  const fetchConfig = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('audit_config')
        .select('*')
        .order('section', { ascending: true })
        .order('action', { ascending: true })

      if (err) throw err
      config.value = data || []
    } catch (err) {
      console.error('Error fetching audit config:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  // Aktualizace konfigurace
  const updateConfig = async (id: string, is_enabled: boolean) => {
    try {
      const { error: err } = await supabase
        .from('audit_config')
        .update({ is_enabled })
        .eq('id', id)

      if (err) throw err

      // Aktualizace lokálního stavu
      const index = config.value.findIndex(c => c.id === id)
      if (index !== -1) {
        config.value[index].is_enabled = is_enabled
      }

      return true
    } catch (err) {
      console.error('Error updating audit config:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return false
    }
  }

  // Vytvoření nového auditního záznamu
  const createLog = async (
    section: string,
    action: string,
    entity_id: string | null,
    details: any
  ) => {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data?.user?.email) {
        throw new Error('User not authenticated')
      }

      const { data, error: err } = await supabase.rpc('create_audit_log', {
        p_user_email: user.data.user.email,
        p_section: section,
        p_action: action,
        p_entity_id: entity_id,
        p_details: details
      })

      if (err) throw err
      return data
    } catch (err) {
      console.error('Error creating audit log:', err)
      throw err
    }
  }

  return {
    logs,
    config,
    loading,
    error,
    fetchLogs,
    fetchConfig,
    updateConfig,
    createLog
  }
}