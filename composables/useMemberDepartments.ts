import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { useToast } from './useToast'
import { getCachedData, setCachedData, clearCache } from '~/utils/cache'

export interface DepartmentPermissions {
  repertoire_view: boolean
  repertoire_edit: boolean
  member_directory_view: boolean
  members_area_view: boolean
  member_resources_view: boolean
  member_resources_upload: boolean
  member_management_create?: boolean
  member_management_edit?: boolean
  member_management_delete?: boolean
}

export interface MemberDepartment {
  id: string
  name: string
  display_name: string
  description: string | null
  permissions: DepartmentPermissions
  is_active: boolean
  created_at: string
  updated_at: string
  member_count?: number
}

export interface CreateDepartmentData {
  name: string
  display_name: string
  description?: string
  permissions?: DepartmentPermissions
}

export interface UpdateDepartmentData {
  display_name?: string
  description?: string
  permissions?: DepartmentPermissions
  is_active?: boolean
}

export const useMemberDepartments = () => {
  const supabase = useSupabaseClient()
  const toast = useToast()

  const departments = ref<MemberDepartment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Načtení všech oddílů
  const fetchDepartments = async (forceRefresh = false) => {
    try {
      // Kontrola cache
      if (!forceRefresh && typeof window !== 'undefined') {
        const cached = getCachedData<MemberDepartment[]>('departments')
        if (cached) {
          departments.value = cached
          return cached
        }
      }

      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('member_departments')
        .select('*')
        .order('display_name')

      if (fetchError) throw fetchError

      if (!data || data.length === 0) {
        departments.value = []
        return []
      }

      // Načtení počtu členů pro každý oddíl
      // Musíme počítat jak podle hlavního department_id, tak podle member_user_departments
      const departmentIds = data.map((d: any) => d.id)

      // Načtení všech členů s jejich ID a hlavním department_id
      const { data: allMembers, error: membersError } = await supabase
        .from('member_users')
        .select('id, department_id')
        .in('department_id', departmentIds)

      // Načtení všech vztahů z member_user_departments
      const { data: multiDeptMembers, error: multiDeptError } = await supabase
        .from('member_user_departments')
        .select('department_id, member_user_id')
        .in('department_id', departmentIds)

      if (membersError) {
        console.error('Error counting members by main department:', membersError)
      }
      if (multiDeptError) {
        console.error('Error counting members by multi-departments:', multiDeptError)
      }

      // Seskupení počtů podle oddílu (používáme Set pro unikátní členy)
      const countsByDepartment: Record<string, Set<string>> = {}

      // Inicializace pro všechny oddíly
      departmentIds.forEach((id: string) => {
        countsByDepartment[id] = new Set()
      })

      // Přidání členů podle hlavního department_id
      if (allMembers) {
        allMembers.forEach((member: any) => {
          if (member.department_id && member.id && countsByDepartment[member.department_id]) {
            countsByDepartment[member.department_id].add(member.id)
          }
        })
      }

      // Přidání členů podle member_user_departments (unikátní členové)
      if (multiDeptMembers) {
        multiDeptMembers.forEach((relation: any) => {
          if (relation.department_id && relation.member_user_id && countsByDepartment[relation.department_id]) {
            countsByDepartment[relation.department_id].add(relation.member_user_id)
          }
        })
      }

      // Mapování oddílů s počty
      departments.value = data.map((dept: any) => ({
        ...dept,
        member_count: countsByDepartment[dept.id]?.size || 0
      }))

      // Uložení do cache
      if (typeof window !== 'undefined') {
        setCachedData('departments', departments.value)
      }

      return departments.value
    } catch (err: any) {
      console.error('Error fetching departments:', err)
      error.value = err.message || 'Nepodařilo se načíst oddíly'
      toast.error(error.value)
      return []
    } finally {
      loading.value = false
    }
  }

  // Vytvoření nového oddílu
  const createDepartment = async (data: CreateDepartmentData) => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch('/api/member-departments/create', {
        method: 'POST',
        body: data
      }) as { success: boolean, department: any }

      toast.success('Oddíl byl úspěšně vytvořen')
      clearCache('departments')
      await fetchDepartments(true)

      return response
    } catch (err: any) {
      console.error('Error creating department:', err)
      error.value = err.data?.message || 'Nepodařilo se vytvořit oddíl'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Aktualizace oddílu
  const updateDepartment = async (id: string, data: UpdateDepartmentData) => {
    try {
      loading.value = true
      error.value = null

      const { error: updateError } = await supabase
        .from('member_departments')
        .update(data)
        .eq('id', id)

      if (updateError) throw updateError

      const successMsg = 'Oddíl byl úspěšně aktualizován'
      toast.success(successMsg)
      clearCache('departments')
      await fetchDepartments(true)
    } catch (err: any) {
      console.error('Error updating department:', err)
      const errorMsg = err.message || 'Nepodařilo se aktualizovat oddíl'
      error.value = errorMsg
      toast.error(errorMsg)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Změna hesla oddílu
  const updateDepartmentPassword = async (id: string, newPassword: string) => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch('/api/member-departments/update-password', {
        method: 'POST',
        body: { departmentId: id, newPassword }
      }) as { success: boolean, message: string, password?: string }

      // Uložení hesla do sessionStorage pro pozdější zobrazení
      if (response.password) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`department_password_${id}`, response.password)
        }
      }

      toast.success('Heslo oddílu bylo úspěšně změněno')
      return response
    } catch (err: any) {
      console.error('Error updating department password:', err)
      error.value = err.data?.message || 'Nepodařilo se změnit heslo oddílu'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Smazání oddílu
  const deleteDepartment = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('member_departments')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      toast.success('Oddíl byl úspěšně smazán')
      clearCache('departments')
      await fetchDepartments(true)
    } catch (err: any) {
      console.error('Error deleting department:', err)
      error.value = err.message || 'Nepodařilo se smazat oddíl'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Získání statistik přihlášení pro oddíl
  const getDepartmentLoginStats = async (departmentId: string, days: number = 30) => {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error: fetchError } = await supabase
        .from('member_login_logs')
        .select('*')
        .eq('department_id', departmentId)
        .gte('login_at', startDate.toISOString())
        .order('login_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err: any) {
      console.error('Error fetching login stats:', err)
      return []
    }
  }

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    updateDepartmentPassword,
    deleteDepartment,
    getDepartmentLoginStats
  }
}

