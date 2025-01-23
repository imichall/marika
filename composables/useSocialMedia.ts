import { useSupabaseClient } from '#imports'
import { ref } from 'vue'

interface SocialMedia {
  id: string
  platform: string
  url: string
  icon: string
  created_at: string
  updated_at: string
}

export const useSocialMedia = () => {
  const supabase = useSupabaseClient()
  const socialMedia = ref<SocialMedia[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSocialMedia = async () => {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('social_media')
        .select('*')
        .order('created_at', { ascending: true })

      if (err) throw err

      socialMedia.value = data as SocialMedia[]
    } catch (err) {
      console.error('Error fetching social media:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  const addSocialMedia = async (data: Omit<SocialMedia, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      loading.value = true
      const { data: newSocialMedia, error: err } = await supabase
        .from('social_media')
        .insert(data)
        .select()
        .single()

      if (err) throw err

      const typedNewSocialMedia = newSocialMedia as SocialMedia
      socialMedia.value.push(typedNewSocialMedia)
      return typedNewSocialMedia
    } catch (err) {
      console.error('Error adding social media:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSocialMedia = async (id: string, data: Partial<SocialMedia>) => {
    try {
      loading.value = true
      const { data: updatedSocialMedia, error: err } = await supabase
        .from('social_media')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      const typedUpdatedSocialMedia = updatedSocialMedia as SocialMedia
      const index = socialMedia.value.findIndex(sm => sm.id === id)
      if (index !== -1) {
        socialMedia.value[index] = typedUpdatedSocialMedia
      }
      return typedUpdatedSocialMedia
    } catch (err) {
      console.error('Error updating social media:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSocialMedia = async (id: string) => {
    try {
      loading.value = true
      const { error: err } = await supabase
        .from('social_media')
        .delete()
        .eq('id', id)

      if (err) throw err

      socialMedia.value = socialMedia.value.filter(sm => sm.id !== id)
    } catch (err) {
      console.error('Error deleting social media:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    socialMedia,
    loading,
    error,
    fetchSocialMedia,
    addSocialMedia,
    updateSocialMedia,
    deleteSocialMedia
  }
}
