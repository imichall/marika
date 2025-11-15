import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { useToast } from './useToast'

export interface DepartmentPermissions {
  repertoire_view: boolean
  repertoire_edit: boolean
  member_directory_view: boolean
  members_area_view: boolean
  member_resources_view: boolean
  member_resources_upload: boolean
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
  password: string
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
  const fetchDepartments = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('member_departments')
        .select(`
          *,
          member_users(count)
        `)
        .order('display_name')

      if (fetchError) throw fetchError

      departments.value = (data || []).map((dept: any) => ({
        ...dept,
        member_count: dept.member_users?.[0]?.count || 0
      }))

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
      })

      toast.success('Oddíl byl úspěšně vytvořen')
      await fetchDepartments()

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
      await fetchDepartments()
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
      })

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
      await fetchDepartments()
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

