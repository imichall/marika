import { ref } from '#imports'
import { useSupabaseClient } from '#imports'

interface User {
  id: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  is_admin: boolean
  created_at: string
  last_sign_in_at: string | null
  confirmed_at: string | null
}

export const useUsers = () => {
  const supabase = useSupabaseClient()
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUsers = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err

      if (data) {
        users.value = data.map(user => ({
          id: user.id,
          email: user.email,
          role: user.role,
          is_admin: user.is_admin,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          confirmed_at: user.confirmed_at
        }))
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  const addUser = async (email: string, password: string, role: User['role']) => {
    try {
      loading.value = true

      // Get current user for audit
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) throw new Error('User not authenticated')

      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (authError) throw authError

      // Set user role
      const { error: roleError } = await supabase
        .from('users')
        .update({ role })
        .eq('id', authData.user.id)

      if (roleError) throw roleError

      // Create audit log
      await supabase.rpc('create_audit_log', {
        p_user_email: currentUser.email,
        p_section: 'users',
        p_action: 'create',
        p_entity_id: authData.user.id,
        p_details: {
          email: email,
          role: role
        }
      })

      await fetchUsers()
      return true
    } catch (err) {
      console.error('Error adding user:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: string, updates: { role?: User['role'] }) => {
    try {
      loading.value = true

      // Get current user for audit
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) throw new Error('User not authenticated')

      // Get user data before update
      const { data: oldData } = await supabase
        .from('users')
        .select('email, role')
        .eq('id', id)
        .single()

      // Update user
      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError

      // Create audit log
      if (oldData) {
        await supabase.rpc('create_audit_log', {
          p_user_email: currentUser.email,
          p_section: 'users',
          p_action: 'update',
          p_entity_id: id,
          p_details: {
            email: oldData.email,
            changes: Object.keys(updates),
            old_role: oldData.role,
            new_role: updates.role
          }
        })
      }

      await fetchUsers()
      return true
    } catch (err) {
      console.error('Error updating user:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: string) => {
    try {
      loading.value = true

      // Get current user for audit
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) throw new Error('User not authenticated')

      // Get user data before deletion
      const { data: userData } = await supabase
        .from('users')
        .select('email, role')
        .eq('id', id)
        .single()

      // Delete user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(id)

      if (deleteError) throw deleteError

      // Create audit log
      if (userData) {
        await supabase.rpc('create_audit_log', {
          p_user_email: currentUser.email,
          p_section: 'users',
          p_action: 'delete',
          p_entity_id: id,
          p_details: {
            email: userData.email,
            role: userData.role
          }
        })
      }

      await fetchUsers()
      return true
    } catch (err) {
      console.error('Error deleting user:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser
  }
}