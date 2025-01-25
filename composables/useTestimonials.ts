import { ref, onMounted } from '#imports'
import { useSupabaseClient } from '#imports'

interface Testimonial {
  id: number
  text: string
  author: string
  source: string | null
  created_at: string
}

export const useTestimonials = () => {
  const supabase = useSupabaseClient()
  const testimonials = ref<Testimonial[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTestimonials = async () => {
    try {
      loading.value = true

      const { data, error: err } = await supabase
        .from('testimonials')
        .select('*')
        .order('id', { ascending: false })

      if (err) throw err

      if (data) {
        testimonials.value = data.map(item => ({
          id: Number(item.id),
          text: String(item.text),
          author: String(item.author),
          source: item.source ? String(item.source) : null,
          created_at: String(item.created_at)
        }))
      } else {
        console.log('Žádná data nebyla načtena')
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  const addTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at'>) => {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('testimonials')
        .insert([testimonial])
        .select()
        .single()

      if (err) throw err

      if (data) {
        testimonials.value.unshift({
          id: Number(data.id),
          text: String(data.text),
          author: String(data.author),
          source: data.source ? String(data.source) : null,
          created_at: String(data.created_at)
        })
      }
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateTestimonial = async (id: number, updates: Partial<Omit<Testimonial, 'id' | 'created_at'>>) => {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      if (data) {
        const index = testimonials.value.findIndex(t => t.id === id)
        if (index !== -1) {
          testimonials.value[index] = {
            id: Number(data.id),
            text: String(data.text),
            author: String(data.author),
            source: data.source ? String(data.source) : null,
            created_at: String(data.created_at)
          }
        }
      }
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteTestimonial = async (id: number) => {
    try {
      loading.value = true
      const { error: err } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)

      if (err) throw err

      testimonials.value = testimonials.value.filter(t => t.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    await fetchTestimonials()
  })

  return {
    testimonials,
    loading,
    error,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    fetchTestimonials
  }
}