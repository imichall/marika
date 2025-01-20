import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

interface Category {
  id: string
  name: string
  created_at: string
}

export const useCategories = () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const supabase = useSupabaseClient()

  const fetchCategories = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (err) throw err

      categories.value = data
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const addCategory = async (name: string) => {
    try {
      const { data, error: err } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()
        .single()

      if (err) throw err

      if (data) {
        categories.value.push(data)
      }
      return data
    } catch (err: any) {
      console.error('Error adding category:', err)
      throw err
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory
  }
}