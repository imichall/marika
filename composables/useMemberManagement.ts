import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { useToast } from './useToast'

export interface MemberUser {
  id: string
  department_id: string
  full_name: string
  email: string | null
  phone: string | null
  street: string | null
  city: string | null
  postal_code: string | null
  full_address: string | null
  birth_date: string | null
  birth_place: string | null
  notes: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  department?: {
    name: string
    display_name: string
  }
}

export interface CreateMemberData {
  department_id: string
  full_name: string
  email?: string
  phone?: string
  street?: string
  city?: string
  postal_code?: string
  full_address?: string
  birth_date?: string
  birth_place?: string
  notes?: string
  avatar_url?: string
  is_active?: boolean
}

export interface UpdateMemberData {
  full_name?: string
  email?: string
  phone?: string
  street?: string
  city?: string
  postal_code?: string
  full_address?: string
  birth_date?: string
  birth_place?: string
  notes?: string
  avatar_url?: string
  is_active?: boolean
  department_id?: string
}

export const useMemberManagement = () => {
  const supabase = useSupabaseClient()
  const toast = useToast()

  const members = ref<MemberUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Načtení všech členů
  const fetchMembers = async (departmentId?: string) => {
    try {
      loading.value = true
      error.value = null

      let query = supabase
        .from('member_users')
        .select(`
          *,
          department:member_departments(name, display_name)
        `)
        .order('full_name')

      if (departmentId) {
        query = query.eq('department_id', departmentId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      members.value = (data || []).map((member: any) => ({
        ...member,
        department: member.department
      }))

      return members.value
    } catch (err: any) {
      console.error('Error fetching members:', err)
      const errorMsg = err.message || 'Nepodařilo se načíst členy'
      error.value = errorMsg
      toast.error(errorMsg)
      return []
    } finally {
      loading.value = false
    }
  }

  // Vytvoření nového člena
  const createMember = async (data: CreateMemberData) => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch('/api/member-users/create', {
        method: 'POST',
        body: data
      }) as { success: boolean, member: MemberUser }

      if (!response.success || !response.member) {
        throw new Error('Nepodařilo se vytvořit člena')
      }

      toast.success('Člen byl úspěšně přidán')
      await fetchMembers()

      return response.member
    } catch (err: any) {
      console.error('Error creating member:', err)
      const errorMsg = err.data?.statusMessage || err.message || 'Nepodařilo se přidat člena'
      error.value = errorMsg
      toast.error(errorMsg)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Aktualizace člena
  const updateMember = async (id: string, data: UpdateMemberData) => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch('/api/member-users/update', {
        method: 'POST',
        body: {
          id,
          ...data
        }
      }) as { success: boolean, member: MemberUser }

      if (!response.success) {
        throw new Error('Nepodařilo se aktualizovat člena')
      }

      const successMsg = 'Člen byl úspěšně aktualizován'
      toast.success(successMsg)
      await fetchMembers()
    } catch (err: any) {
      console.error('Error updating member:', err)
      const errorMsg = err.data?.statusMessage || err.message || 'Nepodařilo se aktualizovat člena'
      error.value = errorMsg
      toast.error(errorMsg)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Smazání člena
  const deleteMember = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch('/api/member-users/delete', {
        method: 'POST',
        body: { id }
      }) as { success: boolean, message: string }

      if (!response.success) {
        throw new Error('Nepodařilo se smazat člena')
      }

      toast.success('Člen byl úspěšně smazán')
      await fetchMembers()
    } catch (err: any) {
      console.error('Error deleting member:', err)
      const errorMsg = err.data?.statusMessage || err.message || 'Nepodařilo se smazat člena'
      error.value = errorMsg
      toast.error(errorMsg)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Hromadný import členů
  const bulkImportMembers = async (departmentId: string, membersData: Array<Omit<CreateMemberData, 'department_id'>>) => {
    try {
      loading.value = true
      error.value = null

      const membersToInsert = membersData.map(m => ({
        ...m,
        department_id: departmentId,
        is_active: m.is_active ?? true
      }))

      const { error: insertError } = await supabase
        .from('member_users')
        .insert(membersToInsert)

      if (insertError) throw insertError

      toast.success(`Úspěšně importováno ${membersData.length} členů`)
      await fetchMembers()
    } catch (err: any) {
      console.error('Error bulk importing members:', err)
      const errorMsg = err.message || 'Nepodařilo se importovat členy'
      error.value = errorMsg
      toast.error(errorMsg)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Získání statistik
  const getMemberStats = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('member_users')
        .select('department_id, is_active')

      if (fetchError) throw fetchError

      const stats = {
        total: data?.length || 0,
        active: data?.filter((m: any) => m.is_active).length || 0,
        byDepartment: {} as Record<string, number>
      }

      data?.forEach((member: any) => {
        if (!stats.byDepartment[member.department_id]) {
          stats.byDepartment[member.department_id] = 0
        }
        stats.byDepartment[member.department_id]++
      })

      return stats
    } catch (err: any) {
      console.error('Error fetching member stats:', err)
      return { total: 0, active: 0, byDepartment: {} }
    }
  }

  return {
    members,
    loading,
    error,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    bulkImportMembers,
    getMemberStats
  }
}

