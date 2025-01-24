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
      console.log('Začínám načítat testimonials...')

      const { data, error: err } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Data z databáze:', data)
      console.log('Chyba z databáze:', err)

      if (err) throw err

      if (data) {
        testimonials.value = data.map(item => ({
          id: Number(item.id),
          text: String(item.text),
          author: String(item.author),
          source: item.source ? String(item.source) : null,
          created_at: String(item.created_at)
        }))
        console.log('Zpracovaná data:', testimonials.value)
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

  onMounted(async () => {
    await fetchTestimonials()
  })

  return {
    testimonials,
    loading,
    error
  }
}