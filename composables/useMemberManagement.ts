import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { useToast } from './useToast'
import { getCachedData, setCachedData, clearCache } from '~/utils/cache'

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
  departments?: Array<{
    id: string
    name: string
    display_name: string
  }>
}

export interface CreateMemberData {
  department_id?: string // Zpětná kompatibilita
  department_ids?: string[] // Nový formát pro více oddílů
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
  department_id?: string // Zpětná kompatibilita
  department_ids?: string[] // Nový formát pro více oddílů
}

export const useMemberManagement = () => {
  const supabase = useSupabaseClient()
  const toast = useToast()

  const members = ref<MemberUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Načtení všech členů
  const fetchMembers = async (departmentId?: string, forceRefresh = false) => {
    try {
      // Kontrola cache (pouze pokud není forceRefresh a není departmentId - cacheujeme pouze všechny členy)
      if (!forceRefresh && !departmentId && typeof window !== 'undefined') {
        const cacheKey = 'members_all'
        const cached = getCachedData<MemberUser[]>(cacheKey)
        if (cached) {
          members.value = cached
          return cached
        }
      }

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
        // Filtrování podle oddílu - zkontrolujeme hlavní department_id nebo member_user_departments
        query = query.or(`department_id.eq.${departmentId},id.in.(select member_user_id from member_user_departments where department_id.eq.${departmentId})`)
      }

      const { data: membersData, error: fetchError } = await query

      if (fetchError) throw fetchError

      if (!membersData || membersData.length === 0) {
        members.value = []
        return []
      }

      // Načtení všech vztahů najednou pro všechny členy (efektivnější než N+1 dotazů)
      const memberIds = membersData.map(m => m.id)
      const { data: allMemberDepartments, error: deptError } = await supabase
        .from('member_user_departments')
        .select(`
          member_user_id,
          department_id,
          department:member_departments(id, name, display_name)
        `)
        .in('member_user_id', memberIds)

      if (deptError) {
        console.error('Error loading member departments:', deptError)
      }

      // Seskupení oddílů podle člena
      const departmentsByMember: Record<string, Array<{ id: string; name: string; display_name: string }>> = {}

      if (allMemberDepartments) {
        allMemberDepartments.forEach((md: any) => {
          if (!departmentsByMember[md.member_user_id]) {
            departmentsByMember[md.member_user_id] = []
          }

          const dept = md.department
          if (dept) {
            departmentsByMember[md.member_user_id].push({
              id: dept.id || md.department_id,
              name: dept.name || '',
              display_name: dept.display_name || dept.name || ''
            })
          } else {
            // Fallback pokud chybí department data
            console.warn(`Missing department data for member ${md.member_user_id}, department_id: ${md.department_id}`)
            departmentsByMember[md.member_user_id].push({
              id: md.department_id,
              name: '',
              display_name: md.department_id
            })
          }
        })
      }

      // Mapování členů s jejich oddíly
      const membersWithDepartments = membersData.map((member: any) => {
        let departments = departmentsByMember[member.id] || []

        // Pokud nemá oddíly v pomocné tabulce, použijeme hlavní department jako fallback
        if (departments.length === 0 && member.department_id) {
          if (member.department) {
            departments = [{
              id: member.department_id,
              name: member.department.name || '',
              display_name: member.department.display_name || member.department.name || ''
            }]
          } else {
            // Pokud nemáme ani department join, zkusíme načíst oddíl přímo
            // (ale to by nemělo být nutné, protože join by měl fungovat)
            console.warn(`Member ${member.id} has department_id but no department data`)
          }
        }

        return {
          ...member,
          department: member.department,
          departments: departments
        }
      })

      members.value = membersWithDepartments

      // Uložení do cache (pouze pokud není departmentId)
      if (!departmentId && typeof window !== 'undefined') {
        setCachedData('members_all', members.value)
      }

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

      // Získání informací o oddílu z localStorage (pokud je přihlášen přes oddíl)
      let departmentData: any = null
      if (process.client) {
        const memberDepartment = localStorage.getItem('memberDepartment')
        if (memberDepartment) {
          try {
            const dept = JSON.parse(memberDepartment)

            // Použijeme data z localStorage, ale zajistíme, že permissions obsahují všechna pole
            departmentData = {
              ...dept,
              permissions: {
                repertoire_view: dept.permissions?.repertoire_view ?? true,
                repertoire_edit: dept.permissions?.repertoire_edit ?? false,
                member_directory_view: dept.permissions?.member_directory_view ?? true,
                members_area_view: dept.permissions?.members_area_view ?? true,
                member_resources_view: dept.permissions?.member_resources_view ?? true,
                member_resources_upload: dept.permissions?.member_resources_upload ?? false,
                member_management_create: dept.permissions?.member_management_create ?? false,
                member_management_edit: dept.permissions?.member_management_edit ?? false,
                member_management_delete: dept.permissions?.member_management_delete ?? false
              }
            }

            console.log('Create member - departmentData:', departmentData)
            console.log('Create member - permissions:', departmentData?.permissions)
            console.log('Create member - member_management_create:', departmentData?.permissions?.member_management_create)
          } catch (e) {
            console.error('Error parsing memberDepartment:', e)
          }
        } else {
          console.log('Create member - no memberDepartment in localStorage')
        }
      }

      const response = await $fetch('/api/member-users/create', {
        method: 'POST',
        body: {
          ...data,
          _departmentData: departmentData // Posíláme data o oddílu v body
        }
      }) as { success: boolean, member: MemberUser }

      if (!response.success || !response.member) {
        throw new Error('Nepodařilo se vytvořit člena')
      }

      toast.success('Člen byl úspěšně přidán')
      clearCache('members_all')
      await fetchMembers(undefined, true)

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

      // Získání informací o oddílu z localStorage (pokud je přihlášen přes oddíl)
      let departmentData: any = null
      if (process.client) {
        const memberDepartment = localStorage.getItem('memberDepartment')
        if (memberDepartment) {
          try {
            departmentData = JSON.parse(memberDepartment)
          } catch (e) {
            console.error('Error parsing memberDepartment:', e)
          }
        }
      }

      const response = await $fetch('/api/member-users/update', {
        method: 'POST',
        body: {
          id,
          ...data,
          _departmentData: departmentData // Posíláme data o oddílu v body
        }
      }) as { success: boolean, member: MemberUser }

      if (!response.success) {
        throw new Error('Nepodařilo se aktualizovat člena')
      }

      const successMsg = 'Člen byl úspěšně aktualizován'
      toast.success(successMsg)
      clearCache('members_all')
      await fetchMembers(undefined, true)
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

      // Získání informací o oddílu z localStorage (pokud je přihlášen přes oddíl)
      let departmentData: any = null
      if (process.client) {
        const memberDepartment = localStorage.getItem('memberDepartment')
        if (memberDepartment) {
          try {
            departmentData = JSON.parse(memberDepartment)
          } catch (e) {
            console.error('Error parsing memberDepartment:', e)
          }
        }
      }

      const response = await $fetch('/api/member-users/delete', {
        method: 'POST',
        body: {
          id,
          _departmentData: departmentData // Posíláme data o oddílu v body
        }
      }) as { success: boolean, message: string }

      if (!response.success) {
        throw new Error('Nepodařilo se smazat člena')
      }

      toast.success('Člen byl úspěšně smazán')
      clearCache('members_all')
      await fetchMembers(undefined, true)
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

  // Hromadný import členů z JSONu
  const bulkImportMembers = async (departmentId: string, membersData: any[]) => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch('/api/member-users/import-bulk', {
        method: 'POST',
        body: {
          department_id: departmentId,
          members: membersData
        }
      }) as { success: boolean, imported: number, members: MemberUser[] }

      if (!response.success) {
        throw new Error('Nepodařilo se importovat členy')
      }

      toast.success(`Úspěšně importováno ${response.imported} členů`)
      clearCache('members_all')
      await fetchMembers(undefined, true)
      return response
    } catch (err: any) {
      console.error('Error bulk importing members:', err)
      const errorMsg = err.data?.statusMessage || err.message || 'Nepodařilo se importovat členy'
      error.value = errorMsg
      toast.error(errorMsg)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Rychlá změna statusu člena bez refreshování celé tabulky
  const updateMemberStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await $fetch('/api/member-users/update', {
        method: 'POST',
        body: {
          id,
          is_active: isActive
        }
      }) as { success: boolean, member: MemberUser }

      if (!response.success) {
        throw new Error('Nepodařilo se aktualizovat status člena')
      }

      // Aktualizuj pouze lokální stav bez refreshování celé tabulky
      const memberIndex = members.value.findIndex(m => m.id === id)
      if (memberIndex !== -1) {
        members.value[memberIndex].is_active = isActive
      }

      return response.member
    } catch (err: any) {
      console.error('Error updating member status:', err)
      throw err
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
    updateMemberStatus,
    deleteMember,
    bulkImportMembers,
    getMemberStats
  }
}

