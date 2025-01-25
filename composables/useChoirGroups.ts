import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

interface ChoirGroup {
  id: string
  name: string
  description: string
  image: string
  created_at: string
  updated_at: string
  button_link: string
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
        .select('id, name, description, image, button_link')
        .order('created_at', { ascending: true })

      if (err) throw err

      if (data) {
        groups.value = data.map(item => ({
          id: String(item.id),
          name: String(item.name),
          description: String(item.description),
          image: String(item.image),
          created_at: String(item.created_at),
          updated_at: String(item.updated_at),
          button_link: String(item.button_link)
        }))
      }
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

      if (newGroup) {
        const mappedGroup = {
          id: String(newGroup.id),
          name: String(newGroup.name),
          description: String(newGroup.description),
          image: String(newGroup.image),
          created_at: String(newGroup.created_at),
          updated_at: String(newGroup.updated_at),
          button_link: String(newGroup.button_link)
        }
        groups.value.push(mappedGroup)
        return mappedGroup
      }
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