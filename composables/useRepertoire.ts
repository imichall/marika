import { computed, ref } from 'vue'
import { useSupabaseClient } from '#imports'
import type { PermissionMap } from '~/types'
import { useToast } from '~/composables/useToast'
import { slugify } from '~/utils/string'
import { getCachedData, setCachedData, clearCache } from '~/utils/cache'

export interface RepertoireFile {
  id: string
  repertoire_id: string
  file_name: string
  storage_path: string
  content_type: string | null
  voice_part: string | null
  created_at: string
}

export interface RepertoireItem {
  id: string
  title: string
  slug: string | null
  authors: string | null
  description: string | null
  character: string | null
  youtube_link: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
  files: RepertoireFile[]
}

interface CreateRepertoireInput {
  title: string
  authors?: string
  description?: string
  character?: string
  youtube_link?: string
  tags?: string[]
}

interface UploadableFile {
  file: File
  voicePart?: string
}

type RepertoirePermissions = PermissionMap<'view' | 'create' | 'edit' | 'delete'>

const BUCKET_ID = 'repertoire'

export const useRepertoire = () => {
  const supabase = useSupabaseClient()
  const toast = useToast()

  const items = ref<RepertoireItem[]>([])
  const loading = ref(false)
  const uploading = ref(false)
  const exportInProgress = ref(false)
  const error = ref<string | null>(null)
  const permissions = ref<RepertoirePermissions>({
    view: false,
    create: false,
    edit: false,
    delete: false
  })

  const isReadOnly = computed(() => !permissions.value.edit && !permissions.value.create)

  const fetchPermissions = async () => {
    try {
      // NEJPRVE zkontroluj oddílová oprávnění (pokud je uživatel přihlášen přes oddíl)
      if (process.client) {
        const memberDepartment = localStorage.getItem('memberDepartment')
        if (memberDepartment) {
          try {
            const dept = JSON.parse(memberDepartment)
            const deptPermissions = dept.permissions || {}

            // Mapování oddílových permissions na repertoire permissions
            const nextPermissions: RepertoirePermissions = {
              view: deptPermissions.repertoire_view === true,
              create: deptPermissions.repertoire_edit === true,
              edit: deptPermissions.repertoire_edit === true,
              delete: deptPermissions.repertoire_edit === true
            }

            console.log('🎵 Using department permissions for repertoire:', nextPermissions)
            permissions.value = nextPermissions
            return nextPermissions
          } catch (err) {
            console.error('Chyba při parsování oddílových oprávnění:', err)
            // Pokračuj na běžnou autentizaci
          }
        }
      }

      // Pokud není přihlášen přes oddíl, použij běžný systém (admin/editor/viewer)
      const actions: Array<keyof RepertoirePermissions> = ['view', 'create', 'edit', 'delete']

      const checks = await Promise.all(
        actions.map(async (action) => {
          const { data, error: permError } = await supabase.rpc('check_permission', {
            p_email: (await supabase.auth.getUser()).data.user?.email ?? '',
            p_section: 'repertoire',
            p_action: action
          })

          if (permError) {
            console.error('Chyba při ověření oprávnění repertoáru:', permError)
            return [action, false] as const
          }

          return [action, Boolean(data)] as const
        })
      )

      const nextPermissions: RepertoirePermissions = {
        view: false,
        create: false,
        edit: false,
        delete: false
      }

      checks.forEach(([action, value]) => {
        nextPermissions[action] = value
      })

      console.log('👤 Using user permissions for repertoire:', nextPermissions)
      permissions.value = nextPermissions
      return nextPermissions
    } catch (err) {
      console.error('Nepodařilo se načíst oprávnění pro repertoár:', err)
      return permissions.value
    }
  }

  const fetchItems = async (forceRefresh = false) => {
    try {
      // Kontrola cache
      if (!forceRefresh && typeof window !== 'undefined') {
        const cached = getCachedData<RepertoireItem[]>('repertoire_items')
        if (cached) {
          items.value = cached
          return cached
        }
      }

      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('repertoire_items')
        .select('*, files:repertoire_files(*)')
        .order('title', { ascending: true })

      if (fetchError) throw fetchError

      items.value = (data ?? []).map((item: any) => ({
        ...item,
        files: item.files ?? []
      }))

      // Uložení do cache
      if (typeof window !== 'undefined') {
        setCachedData('repertoire_items', items.value)
      }
    } catch (err: any) {
      console.error('Chyba při načítání repertoáru:', err)
      error.value = err.message ?? 'Nepodařilo se načíst repertoár'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createItem = async (payload: CreateRepertoireInput, files: UploadableFile[] = []) => {
    try {
      loading.value = true
      error.value = null

      // Vygenerujeme slug z názvu
      let slug = slugify(payload.title)

      // Zkontrolujeme, zda slug už neexistuje
      const { data: existing } = await supabase
        .from('repertoire_items')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (existing) {
        // Pokud slug existuje, přidáme timestamp
        slug = `${slug}-${Date.now().toString().slice(-8)}`
      }

      const { data, error: insertError } = await supabase
        .from('repertoire_items')
        .insert([
          {
            title: payload.title.trim(),
            slug,
            authors: payload.authors?.trim() ?? null,
            description: payload.description?.trim() ?? null,
            character: payload.character?.trim() ?? null,
            youtube_link: payload.youtube_link?.trim() ?? null,
            tags: payload.tags?.length ? payload.tags : null
          } as any
        ])
        .select('*, files:repertoire_files(*)')
        .single()

      if (insertError) throw insertError

      if (files.length > 0 && data) {
        await uploadFiles(data.id, files)
        clearCache('repertoire_items')
        await fetchItems(true)
      } else if (data) {
        items.value = [data as RepertoireItem, ...items.value]
        clearCache('repertoire_items')
      }

      return data
    } catch (err: any) {
      console.error('Chyba při vytváření skladby:', err)
      error.value = err.message ?? 'Skladbu se nepodařilo vytvořit'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateItem = async (id: string, payload: Partial<CreateRepertoireInput>) => {
    try {
      loading.value = true
      error.value = null

      const updateData: any = {
        ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
        ...(payload.authors !== undefined ? { authors: payload.authors?.trim() ?? null } : {}),
        ...(payload.description !== undefined ? { description: payload.description?.trim() ?? null } : {}),
        ...(payload.character !== undefined ? { character: payload.character?.trim() ?? null } : {}),
        ...(payload.youtube_link !== undefined ? { youtube_link: payload.youtube_link?.trim() ?? null } : {}),
        ...(payload.tags !== undefined ? { tags: payload.tags.length ? payload.tags : null } : {})
      }

      // Pokud se mění název, aktualizujeme slug
      if (payload.title !== undefined) {
        let slug = slugify(payload.title)

        // Zkontrolujeme, zda slug už neexistuje u jiného itemu
        const { data: existing } = await supabase
          .from('repertoire_items')
          .select('id')
          .eq('slug', slug)
          .neq('id', id)
          .maybeSingle()

        if (existing) {
          // Pokud slug existuje u jiného itemu, přidáme timestamp
          slug = `${slug}-${Date.now().toString().slice(-8)}`
        }

        updateData.slug = slug
      }

      const { data, error: updateError } = await supabase
        .from('repertoire_items')
        .update(updateData)
        .eq('id', id)
        .select('*, files:repertoire_files(*)')
        .single()

      if (updateError) throw updateError

      items.value = items.value.map((item) => (item.id === id ? { ...item, ...data, files: data?.files ?? item.files } : item))
      clearCache('repertoire_items')
      return data
    } catch (err: any) {
      console.error('Chyba při aktualizaci skladby:', err)
      error.value = err.message ?? 'Skladbu se nepodařilo upravit'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteItem = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const target = items.value.find((item) => item.id === id)
      if (target?.files?.length) {
        const paths = target.files.map((file) => file.storage_path)
        const { error: storageError } = await supabase.storage.from(BUCKET_ID).remove(paths)
        if (storageError) {
          console.warn('Soubory repertoáru se nepodařilo odstranit:', storageError)
        }
      }

      const { error: deleteError } = await supabase.from('repertoire_items').delete().eq('id', id)
      if (deleteError) throw deleteError

      items.value = items.value.filter((item) => item.id !== id)
      clearCache('repertoire_items')
    } catch (err: any) {
      console.error('Chyba při mazání skladby:', err)
      error.value = err.message ?? 'Skladbu se nepodařilo odstranit'
      throw err
    } finally {
      loading.value = false
    }
  }

  const sanitizeFileName = (name: string) =>
    name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
      .toLowerCase()

  const uploadFiles = async (repertoireId: string, files: UploadableFile[]) => {
    if (!files.length) return []

    uploading.value = true
    const uploadedFiles: RepertoireFile[] = []

    try {
      for (const fileInput of files) {
        const timestamp = Date.now()
        const sanitized = sanitizeFileName(fileInput.file.name)
        const path = `${repertoireId}/${timestamp}-${sanitized}`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_ID)
          .upload(path, fileInput.file, {
            cacheControl: '3600',
            upsert: true,
            contentType: fileInput.file.type
          })

        if (uploadError) throw uploadError

        const { data: createdFile, error: insertError } = await supabase
          .from('repertoire_files')
          .insert([
            {
              repertoire_id: repertoireId,
              file_name: fileInput.file.name,
              storage_path: path,
              content_type: fileInput.file.type,
              voice_part: fileInput.voicePart ?? null
            }
          ])
          .select()
          .single()

        if (insertError) throw insertError
        uploadedFiles.push(createdFile as RepertoireFile)
      }

      items.value = items.value.map((item) =>
        item.id === repertoireId
          ? {
              ...item,
              files: [...item.files, ...uploadedFiles]
            }
          : item
      )

      clearCache('repertoire_items')
      return uploadedFiles
    } catch (err: any) {
      console.error('Chyba při nahrávání souborů repertoáru:', err)
      error.value = err.message ?? 'Soubory se nepodařilo nahrát'
      throw err
    } finally {
      uploading.value = false
    }
  }

  const removeFile = async (file: RepertoireFile) => {
    try {
      uploading.value = true
      error.value = null

      const { error: storageError } = await supabase.storage.from(BUCKET_ID).remove([file.storage_path])
      if (storageError) throw storageError

      const { error: deleteError } = await supabase.from('repertoire_files').delete().eq('id', file.id)
      if (deleteError) throw deleteError

      items.value = items.value.map((item) =>
        item.id === file.repertoire_id
          ? {
              ...item,
              files: item.files.filter((f) => f.id !== file.id)
            }
          : item
      )

      clearCache('repertoire_items')
    } catch (err: any) {
      console.error('Chyba při odstraňování souboru repertoáru:', err)
      error.value = err.message ?? 'Soubor se nepodařilo odstranit'
      throw err
    } finally {
      uploading.value = false
    }
  }

  const getSignedUrl = async (file: RepertoireFile, expiresInSeconds = 120) => {
    const { data, error: urlError } = await supabase.storage
      .from(BUCKET_ID)
      .createSignedUrl(file.storage_path, expiresInSeconds, {
        download: file.file_name
      })

    if (urlError) {
      console.error('Nepodařilo se vytvořit odkaz pro stažení not:', urlError)
      toast.error('Nepodařilo se vytvořit odkaz pro stažení')
      return null
    }

    return data?.signedUrl ?? null
  }

  const downloadFile = async (file: RepertoireFile) => {
    const signedUrl = await getSignedUrl(file)
    if (signedUrl) {
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const exportSelectionToExcel = async (selected: RepertoireItem[]) => {
    try {
      if (!selected.length) return
      exportInProgress.value = true

      const XLSX = await import('xlsx')

      const rows = selected.map((item) => ({
        Autor: item.authors ?? '',
        'Název skladby': item.title,
        'Počet souborů': item.files.length,
        'Seznam souborů': item.files.map((file) => file.file_name).join(', ')
      }))

      const worksheet = XLSX.utils.json_to_sheet(rows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Repertoár')

      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `repertoar-${new Date().toISOString().slice(0, 10)}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Chyba při exportu repertoáru:', err)
      toast.error('Export do Excelu se nepodařil')
      throw err
    } finally {
      exportInProgress.value = false
    }
  }

  return {
    items,
    loading,
    uploading,
    exportInProgress,
    error,
    permissions,
    isReadOnly,
    fetchPermissions,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    uploadFiles,
    removeFile,
    downloadFile,
    exportSelectionToExcel
  }
}

