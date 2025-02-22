import { ref } from '#imports'
import { useSupabaseClient } from '#imports'

interface User {
  id: string
  email: string
  name?: string
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

      const { data, error: fetchError } = await supabase
        .rpc('get_users')

      if (fetchError) throw fetchError

      users.value = data || []
    } catch (err) {
      error.value = 'Nepodařilo se načíst seznam uživatelů'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addUser = async (email: string, password: string, role: User['role']) => {
    try {
      loading.value = true
      error.value = null

      const response = await fetch('/.netlify/functions/create-user', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      await fetchUsers()
      return data
    } catch (err) {
      error.value = 'Nepodařilo se vytvořit uživatele'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: string, updates: { role: User['role']; name?: string }) => {
    try {
      loading.value = true
      error.value = null

      // Najdeme uživatele v našem seznamu
      const user = users.value.find(u => u.id === id)
      if (!user?.email) throw new Error('User email not found')

      // Aktualizujeme záznam v user_roles podle emailu
      const { error: updateError } = await supabase
        .from('user_roles')
        .upsert({
          email: user.email,
          role: updates.role,
          name: updates.name,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        })

      if (updateError) throw updateError

      await fetchUsers()
    } catch (err) {
      error.value = 'Nepodařilo se upravit uživatele'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase.auth.admin.deleteUser(id)

      if (deleteError) throw deleteError

      await fetchUsers()
    } catch (err) {
      error.value = 'Nepodařilo se smazat uživatele'
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