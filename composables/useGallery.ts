import { ref } from '#imports'
import { useSupabaseClient } from '#imports'
import { useToast } from '~/composables/useToast'

const CACHE_KEY = 'gallery_images_cache'
const CACHE_TIMESTAMP_KEY = 'gallery_images_cache_timestamp'
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour
const ITEMS_PER_PAGE = 12

export interface GalleryImage {
  id: number
  image_url: string
  title: string
  is_visible: boolean
  created_at: string
  position: number | null
}

interface Toast {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

export const useGallery = () => {
  const supabase = useSupabaseClient()
  const images = ref<GalleryImage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(0)
  const totalImages = ref(0)
  const usedPositions = ref<Set<number>>(new Set())
  const { showToast } = useToast() as { showToast: Toast }
  const allImages = ref<GalleryImage[]>([])

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_TIMESTAMP_KEY)
  }

  const fetchImages = async () => {
    try {
      loading.value = true
      error.value = null

      // Get total count first
      const { count } = await supabase
        .from('gallery')
        .select('*', { count: 'exact', head: true })

      if (count !== null) {
        totalImages.value = count
        totalPages.value = Math.ceil(count / ITEMS_PER_PAGE)
      }

      // Načteme všechny obrázky pro allImages
      const { data: allData } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })

      if (allData) {
        allImages.value = allData.map((item: any) => ({
          id: Number(item.id),
          image_url: String(item.image_url),
          title: String(item.title),
          is_visible: Boolean(item.is_visible),
          created_at: String(item.created_at),
          position: item.position ? Number(item.position) : null
        }))
      }

      // Get paginated data for current page
      const { data, error: err } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })
        .range(
          (currentPage.value - 1) * ITEMS_PER_PAGE,
          currentPage.value * ITEMS_PER_PAGE - 1
        )

      if (err) throw err

      if (data) {
        images.value = data.map((item: any) => ({
          id: Number(item.id),
          image_url: String(item.image_url),
          title: String(item.title),
          is_visible: Boolean(item.is_visible),
          created_at: String(item.created_at),
          position: item.position ? Number(item.position) : null
        }))
      }

      // Update cache with current page data
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        images: images.value,
        total: totalImages.value,
        currentPage: currentPage.value
      }))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())

    } catch (err) {
      console.error('Error fetching gallery images:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  const fetchAllVisibleImages = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('gallery')
        .select('*')
        .eq('is_visible', true)
        .order('position', { ascending: true })

      if (err) throw err

      if (data) {
        images.value = data.map((item: any) => ({
          id: Number(item.id),
          image_url: String(item.image_url),
          title: String(item.title),
          is_visible: Boolean(item.is_visible),
          created_at: String(item.created_at),
          position: item.position ? Number(item.position) : null
        }))
      }

    } catch (err) {
      console.error('Error fetching gallery images:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  const toggleVisibility = async (imageId: number, isVisible: boolean) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('User not authenticated')

      // Nejprve získáme data obrázku pro audit
      const { data: image } = await supabase
        .from('gallery')
        .select('title')
        .eq('id', imageId)
        .single()

      const { error: err } = await supabase
        .from('gallery')
        .update({ is_visible: isVisible })
        .eq('id', imageId)

      if (err) {
        error.value = err.message;
        return { success: false, error: err.message };
      }

      // Update local state
      const imageInState = images.value.find((img: GalleryImage) => img.id === imageId)
      if (imageInState) {
        imageInState.is_visible = isVisible
      }

      // Vytvoření auditního záznamu
      if (image) {
        await supabase.rpc('create_audit_log', {
          p_user_email: user.email,
          p_section: 'gallery',
          p_action: 'update',
          p_entity_id: imageId.toString(),
          p_details: {
            title: image.title,
            change: `Viditelnost nastavena na ${isVisible ? 'viditelné' : 'skryté'}`
          }
        })
      }

      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    }
  }

  const addImage = async (file: File, title: string) => {
    try {
      loading.value = true
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-')}`

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('User not authenticated')

      // Upload image
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Create gallery record
      const { data: galleryData, error: galleryError } = await supabase
        .from('gallery')
        .insert([{
          title,
          image_url: `${supabaseUrl}/storage/v1/object/public/gallery/${fileName}`
        }])
        .select()
        .single()

      if (galleryError) throw galleryError

      // Vytvoření auditního záznamu
      if (galleryData) {
        await supabase.rpc('create_audit_log', {
          p_user_email: user.email,
          p_section: 'gallery',
          p_action: 'create',
          p_entity_id: galleryData.id.toString(),
          p_details: { title: galleryData.title }
        })
      }

      await fetchImages()
      return galleryData
    } catch (err) {
      console.error('Error adding image:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteImage = async (id: number, fileName: string) => {
    try {
      loading.value = true

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('User not authenticated')

      // Nejprve získáme data obrázku pro audit
      const { data: image } = await supabase
        .from('gallery')
        .select('title')
        .eq('id', id)
        .single()

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('gallery')
        .remove([fileName])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError

      // Vytvoření auditního záznamu
      if (image) {
        await supabase.rpc('create_audit_log', {
          p_user_email: user.email,
          p_section: 'gallery',
          p_action: 'delete',
          p_entity_id: id.toString(),
          p_details: {
            title: image.title,
            file_name: fileName
          }
        })
      }

      await fetchImages()
      return true
    } catch (err) {
      console.error('Error deleting image:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const changePage = async (page: number) => {
    if (page === currentPage.value) return
    currentPage.value = page
    await fetchImages()
  }

  const updatePosition = async (imageId: number, newPosition: number) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('User not authenticated')

      // Nejprve získáme data obrázku pro audit
      const { data: image } = await supabase
        .from('gallery')
        .select('title, position')
        .eq('id', imageId)
        .single()

      const { error: err } = await supabase
        .from('gallery')
        .update({ position: newPosition })
        .eq('id', imageId)

      if (err) throw err

      // Vytvoření auditního záznamu
      if (image) {
        await supabase.rpc('create_audit_log', {
          p_user_email: user.email,
          p_section: 'gallery',
          p_action: 'update',
          p_entity_id: imageId.toString(),
          p_details: {
            title: image.title,
            change: `Pozice změněna z ${image.position || 'nezařazeno'} na ${newPosition}`
          }
        })
      }

      await fetchImages()
      return true
    } catch (err) {
      console.error('Error updating position:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      throw err
    }
  }

  const updateUsedPositions = () => {
    usedPositions.value = new Set(
      images.value
        .map((img: GalleryImage) => img.position)
        .filter((pos: number | null) => pos !== null && pos !== undefined)
    )
  }

  const handlePositionChange = async (event: Event, image: GalleryImage) => {
    const input = event.target as HTMLInputElement
    const newPosition = parseInt(input.value)
    const toast = useToast()

    // Validace hodnoty
    if (isNaN(newPosition) || newPosition < 1 || newPosition > 9) {
      input.value = image.position?.toString() || ''
      toast.error('Zadejte číslo od 1 do 9')
      return
    }

    // Kontrola duplicity - nejdřív zkontrolujeme v databázi
    const { data: existingImage } = await supabase
      .from('gallery')
      .select('id')
      .eq('position', newPosition)
      .neq('id', image.id)
      .single()

    if (existingImage) {
      input.value = image.position?.toString() || ''
      toast.error('Tato pozice je již obsazena jiným obrázkem')
      return
    }

    // Aktualizace pozice v databázi
    const result = await updatePosition(image.id, newPosition)
    if (result.success) {
      // Aktualizace lokálního stavu
      image.position = newPosition
      updateUsedPositions()
      toast.success('Pozice byla úspěšně aktualizována')

      // Obnovíme data ze serveru pro jistotu
      await fetchImages()
    } else {
      input.value = image.position?.toString() || ''
      toast.error(result.error || 'Nepodařilo se aktualizovat pozici')
    }
  }

  return {
    images,
    loading,
    error,
    currentPage,
    totalPages,
    totalImages,
    fetchImages,
    fetchAllVisibleImages,
    deleteImage,
    clearCache,
    toggleVisibility,
    changePage,
    handlePositionChange,
    updateUsedPositions,
    updatePosition,
    allImages,
    addImage
  }
}