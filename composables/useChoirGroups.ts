import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

interface ChoirGroup {
  id: string
  name: string
  description: string
  image: string
  created_at: string
  updated_at: string
}

export const useChoirGroups = () => {
  const groups = ref<ChoirGroup[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const supabase = useSupabaseClient()

  const fetchGroups = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('choir_groups')
        .select('*')
        .order('name')

      if (err) throw err

      groups.value = data
    } catch (err: any) {
      console.error('Error fetching choir groups:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const updateGroup = async (id: string, data: Partial<ChoirGroup>) => {
    try {
      const { data: updatedGroup, error: err } = await supabase
        .from('choir_groups')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      // Aktualizujeme lokální stav
      const index = groups.value.findIndex(g => g.id === id)
      if (index !== -1) {
        groups.value[index] = { ...groups.value[index], ...updatedGroup }
      }

      return updatedGroup
    } catch (err: any) {
      console.error('Error updating choir group:', err)
      throw err
    }
  }

  const addGroup = async (data: Omit<ChoirGroup, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newGroup, error: err } = await supabase
        .from('choir_groups')
        .insert([data])
        .select()
        .single()

      if (err) throw err

      groups.value.push(newGroup)
      return newGroup
    } catch (err: any) {
      console.error('Error adding choir group:', err)
      throw err
    }
  }

  const deleteGroup = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('choir_groups')
        .delete()
        .eq('id', id)

      if (err) throw err

      // Aktualizujeme lokální stav
      groups.value = groups.value.filter(g => g.id !== id)
    } catch (err: any) {
      console.error('Error deleting choir group:', err)
      throw err
    }
  }

  return {
    groups,
    loading,
    error,
    fetchGroups,
    updateGroup,
    addGroup,
    deleteGroup
  }
}