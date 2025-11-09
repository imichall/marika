import { ref } from 'vue'
// @ts-ignore #imports is provided by Nuxt auto-imports
import { useSupabaseClient } from '#imports'
import type { PermissionMap } from '~/types'
import { useToast } from '~/composables/useToast'

export interface MemberResource {
  id: string
  title: string
  description: string | null
  category: string | null
  file_name: string
  storage_path: string
  content_type: string | null
  created_at: string
  updated_at: string
}

interface ResourcePayload {
  title: string
  description?: string | null
  category?: string | null
}

type MemberResourcePermissions = PermissionMap<'view' | 'create' | 'edit' | 'delete'>

const BUCKET_ID = 'member-resources'

export const useMemberResources = () => {
  const supabase = useSupabaseClient()
  const toast = useToast()

  const resources = ref<MemberResource[]>([])
  const loading = ref(false)
  const uploading = ref(false)
  const error = ref<string | null>(null)
  const permissions = ref<MemberResourcePermissions>({
    view: false,
    create: false,
    edit: false,
    delete: false
  })

  const sanitizeFileName = (name: string) =>
    name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
      .toLowerCase()

  const fetchPermissions = async () => {
    try {
      const { data: user } = await supabase.auth.getUser()
      const email = user.user?.email ?? ''

      const actions: Array<keyof MemberResourcePermissions> = ['view', 'create', 'edit', 'delete']
      const checks = await Promise.all(
        actions.map(async (action) => {
          const { data, error: permError } = await supabase.rpc('check_permission', {
            p_email: email,
            p_section: 'member_resources',
            p_action: action
          })

          if (permError) {
            console.error('Chyba při ověřování oprávnění dokumentů:', permError)
            return [action, false] as const
          }
          return [action, Boolean(data)] as const
        })
      )

      const next: MemberResourcePermissions = {
        view: false,
        create: false,
        edit: false,
        delete: false
      }
      checks.forEach(([action, value]) => {
        next[action] = value
      })
      permissions.value = next
      return next
    } catch (err) {
      console.error('Oprávnění dokumentů se nepodařilo načíst:', err)
      return permissions.value
    }
  }

  const fetchResources = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('member_resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      resources.value = data ?? []
    } catch (err: any) {
      console.error('Chyba při načítání dokumentů:', err)
      error.value = err.message ?? 'Dokumenty se nepodařilo načíst'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createResource = async (payload: ResourcePayload, file: File) => {
    if (!file) {
      throw new Error('Soubor je povinný')
    }

    uploading.value = true
    error.value = null

    try {
      const timestamp = Date.now()
      const sanitized = sanitizeFileName(file.name)
      const storagePath = `${timestamp}-${sanitized}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_ID)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        })

      if (uploadError) throw uploadError

      const { data, error: insertError } = await supabase
        .from('member_resources')
        .insert([
          {
            title: payload.title.trim(),
            description: payload.description ?? null,
            category: payload.category ?? null,
            file_name: file.name,
            storage_path: storagePath,
            content_type: file.type
          }
        ])
        .select()
        .single()

      if (insertError) throw insertError
      if (data) resources.value = [data as MemberResource, ...resources.value]
      return data
    } catch (err: any) {
      console.error('Chyba při nahrávání dokumentu:', err)
      error.value = err.message ?? 'Dokument se nepodařilo nahrát'
      throw err
    } finally {
      uploading.value = false
    }
  }

  const updateResource = async (id: string, payload: ResourcePayload) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('member_resources')
        .update({
          ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
          ...(payload.description !== undefined ? { description: payload.description ?? null } : {}),
          ...(payload.category !== undefined ? { category: payload.category ?? null } : {})
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      resources.value = resources.value.map((resource) => (resource.id === id ? (data as MemberResource) : resource))
      return data
    } catch (err: any) {
      console.error('Chyba při aktualizaci dokumentu:', err)
      error.value = err.message ?? 'Dokument se nepodařilo upravit'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteResource = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const resource = resources.value.find((item) => item.id === id)
      if (!resource) throw new Error('Dokument nebyl nalezen')

      const { error: storageError } = await supabase.storage.from(BUCKET_ID).remove([resource.storage_path])
      if (storageError) throw storageError

      const { error: deleteError } = await supabase.from('member_resources').delete().eq('id', id)
      if (deleteError) throw deleteError

      resources.value = resources.value.filter((item) => item.id !== id)
    } catch (err: any) {
      console.error('Chyba při mazání dokumentu:', err)
      error.value = err.message ?? 'Dokument se nepodařilo odstranit'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createSignedUrl = async (
    resource: MemberResource,
    {
      expiresIn = 120,
      download = false,
      silent = false
    }: { expiresIn?: number; download?: boolean; silent?: boolean } = {}
  ) => {
    try {
      const options = download ? ({ download: resource.file_name } as { download: string }) : undefined
      const { data, error: urlError } = await supabase.storage
        .from(BUCKET_ID)
        .createSignedUrl(resource.storage_path, expiresIn, options)

      if (urlError) throw urlError
      return data?.signedUrl ?? null
    } catch (err) {
      console.error('Chyba při generování odkazu na dokument:', err)
      if (!silent) {
        toast.error('Nepodařilo se vytvořit odkaz pro tento dokument')
      }
      return null
    }
  }

  const downloadResource = async (resource: MemberResource) => {
    const signedUrl = await createSignedUrl(resource, { download: true })
    if (signedUrl) {
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const getPreviewUrl = async (resource: MemberResource) => {
    return createSignedUrl(resource, { expiresIn: 600, silent: true })
  }

  return {
    resources,
    permissions,
    loading,
    uploading,
    error,
    fetchPermissions,
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
    downloadResource,
    getPreviewUrl
  }
}

