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

      categories.value = data?.map(item => ({
        id: String(item.id),
        name: String(item.name),
        created_at: String(item.created_at)
      })) || []
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const addCategory = async (name: string) => {
    try {
      loading.value = true
      error.value = null

      const { data: newData, error: err } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()
        .single()

      if (err) throw err

      if (!newData) {
        throw new Error('Kategorie nebyla vytvořena')
      }

      const category: Category = {
        id: String(newData.id),
        name: String(newData.name),
        created_at: String(newData.created_at)
      }

      categories.value.push(category)
      return category
    } catch (err: any) {
      console.error('Error adding category:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
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