import { useSupabaseClient } from '#imports'
import { Database } from '~/types/supabase'
import { useAuth } from '~/composables/useAuth'

export interface ChangelogEntry {
  id?: number
  version: string
  branch: 'main' | 'dev'
  commit_sha?: string
  commit_url?: string
  author: string
  date: Date
  changes: string[]
}

export const useChangelog = () => {
  const supabase = useSupabaseClient<Database>()
  const { user } = useAuth()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const checkPermission = () => {
    if (!user.value?.email || user.value.email !== 'iimichal.svoboda@gmail.com') {
      throw new Error('Nemáte oprávnění upravovat changelog')
    }
  }

  // Načtení changelogu pro konkrétní branch
  const getChangelog = async (branch: 'main' | 'dev') => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('changelog')
        .select('*')
        .eq('branch', branch)
        .order('date', { ascending: false })

      if (err) throw err

      return data
    } catch (err) {
      console.error('Error fetching changelog:', err)
      error.value = 'Nepodařilo se načíst changelog'
      return []
    } finally {
      loading.value = false
    }
  }

  // Přidání nového záznamu
  const addChangelogEntry = async (entry: ChangelogEntry) => {
    try {
      loading.value = true
      error.value = null

      checkPermission()

      const { data, error: err } = await supabase
        .from('changelog')
        .insert([entry])
        .select()
        .single()

      if (err) throw err

      return data
    } catch (err: any) {
      console.error('Error adding changelog entry:', err)
      error.value = err.message || 'Nepodařilo se přidat záznam do changelogu'
      return null
    } finally {
      loading.value = false
    }
  }

  // Úprava existujícího záznamu
  const updateChangelogEntry = async (id: number, entry: Partial<ChangelogEntry>) => {
    try {
      loading.value = true
      error.value = null

      checkPermission()

      const { data, error: err } = await supabase
        .from('changelog')
        .update(entry)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      return data
    } catch (err: any) {
      console.error('Error updating changelog entry:', err)
      error.value = err.message || 'Nepodařilo se upravit záznam v changelogu'
      return null
    } finally {
      loading.value = false
    }
  }

  // Smazání záznamu
  const deleteChangelogEntry = async (id: number) => {
    try {
      loading.value = true
      error.value = null

      checkPermission()

      const { error: err } = await supabase
        .from('changelog')
        .delete()
        .eq('id', id)

      if (err) throw err

      return true
    } catch (err: any) {
      console.error('Error deleting changelog entry:', err)
      error.value = err.message || 'Nepodařilo se smazat záznam z changelogu'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getChangelog,
    addChangelogEntry,
    updateChangelogEntry,
    deleteChangelogEntry
  }
}