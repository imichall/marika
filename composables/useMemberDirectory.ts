import { computed, ref } from 'vue'
import { useSupabaseClient } from '#imports'
import type { PermissionMap } from '~/types'

export interface MemberDirectoryEntry {
  id: string
  full_name: string
  voice_part: string | null
  joined_at: string | null
  left_at: string | null
  email: string | null
  phone: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface MemberPayload {
  full_name: string
  voice_part?: string | null
  joined_at?: string | null
  left_at?: string | null
  email?: string | null
  phone?: string | null
  notes?: string | null
  is_active?: boolean
}

type MemberDirectoryPermissions = PermissionMap<'view' | 'create' | 'edit' | 'delete'>

export const useMemberDirectory = () => {
  const supabase = useSupabaseClient()

  const members = ref<MemberDirectoryEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const permissions = ref<MemberDirectoryPermissions>({
    view: false,
    create: false,
    edit: false,
    delete: false
  })

  const sortedMembers = computed(() =>
    [...members.value].sort((a, b) =>
      a.full_name.localeCompare(b.full_name, 'cs', { sensitivity: 'base' })
    )
  )

  const fetchPermissions = async () => {
    try {
      const { data: user } = await supabase.auth.getUser()
      const email = user.user?.email ?? ''

      const actions: Array<keyof MemberDirectoryPermissions> = ['view', 'create', 'edit', 'delete']
      const results = await Promise.all(
        actions.map(async (action) => {
          const { data, error: permError } = await supabase.rpc('check_permission', {
            p_email: email,
            p_section: 'member_directory',
            p_action: action
          })
          if (permError) {
            console.error('Chyba při načítání oprávnění členského seznamu:', permError)
            return [action, false] as const
          }
          return [action, Boolean(data)] as const
        })
      )

      const next: MemberDirectoryPermissions = {
        view: false,
        create: false,
        edit: false,
        delete: false
      }
      results.forEach(([action, allowed]) => {
        next[action] = allowed
      })
      permissions.value = next
      return next
    } catch (err) {
      console.error('Oprávnění členského seznamu se nepodařilo načíst:', err)
      return permissions.value
    }
  }

  const fetchMembers = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('member_directory')
        .select('*')
        .order('full_name', { ascending: true })

      if (fetchError) throw fetchError
      members.value = data ?? []
    } catch (err: any) {
      console.error('Chyba při načítání členů:', err)
      error.value = err.message ?? 'Seznam členů se nepodařilo načíst'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createMember = async (payload: MemberPayload) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('member_directory')
        .insert([
          {
            full_name: payload.full_name.trim(),
            voice_part: payload.voice_part ?? null,
            joined_at: payload.joined_at ?? null,
            left_at: payload.left_at ?? null,
            email: payload.email ?? null,
            phone: payload.phone ?? null,
            notes: payload.notes ?? null,
            is_active: payload.is_active ?? false
          }
        ])
        .select()
        .single()

      if (insertError) throw insertError
      if (data) members.value = [data as MemberDirectoryEntry, ...members.value]
      return data
    } catch (err: any) {
      console.error('Chyba při přidávání člena:', err)
      error.value = err.message ?? 'Člena se nepodařilo přidat'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMember = async (id: string, payload: MemberPayload) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('member_directory')
        .update({
          ...(payload.full_name !== undefined ? { full_name: payload.full_name.trim() } : {}),
          ...(payload.voice_part !== undefined ? { voice_part: payload.voice_part ?? null } : {}),
          ...(payload.joined_at !== undefined ? { joined_at: payload.joined_at ?? null } : {}),
          ...(payload.left_at !== undefined ? { left_at: payload.left_at ?? null } : {}),
          ...(payload.email !== undefined ? { email: payload.email ?? null } : {}),
          ...(payload.phone !== undefined ? { phone: payload.phone ?? null } : {}),
          ...(payload.notes !== undefined ? { notes: payload.notes ?? null } : {}),
          ...(payload.is_active !== undefined ? { is_active: payload.is_active } : {})
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      members.value = members.value.map((member) => (member.id === id ? (data as MemberDirectoryEntry) : member))
      return data
    } catch (err: any) {
      console.error('Chyba při aktualizaci člena:', err)
      error.value = err.message ?? 'Člena se nepodařilo upravit'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMember = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase.from('member_directory').delete().eq('id', id)
      if (deleteError) throw deleteError

      members.value = members.value.filter((member) => member.id !== id)
    } catch (err: any) {
      console.error('Chyba při mazání člena:', err)
      error.value = err.message ?? 'Člena se nepodařilo odstranit'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    members,
    sortedMembers,
    permissions,
    loading,
    error,
    fetchPermissions,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember
  }
}

