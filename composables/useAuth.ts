import { ref, computed } from 'vue'
import { useSupabaseClient } from '#imports'
import { useSupabaseUser } from '#imports'
import type { User } from '@supabase/supabase-js'

export interface User {
  email: string;
  id: string;
}

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Check current session
  const checkUser = async () => {
    try {
      const { data: { user: authUser }, error: sessionError } = await supabase.auth.getUser()
      if (sessionError || !authUser) {
        user.value = null
        isAuthenticated.value = false
        return null
      }

      user.value = authUser
      isAuthenticated.value = true
      return authUser
    } catch (err: any) {
      console.error('Error checking auth status:', err)
      error.value = err.message
      user.value = null
      isAuthenticated.value = false
      return null
    }
  }

  // Login
  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null

      const { data: { user: authUser }, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (signInError) throw signInError

      user.value = authUser
      isAuthenticated.value = true
      return true
    } catch (err: any) {
      console.error('Error logging in:', err)
      error.value = err.message
      user.value = null
      isAuthenticated.value = false
      return false
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = async () => {
    try {
      loading.value = true
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      user.value = null
      isAuthenticated.value = false
    } catch (err: any) {
      console.error('Error logging out:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Initialize auth state
  if (process.client) {
    checkUser()

    // Watch for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
    })
  }

  const isAdmin = async () => {
    if (!user.value?.email) return false

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.value.email)
        .single()

      if (error) {
        console.error('Error checking admin status:', error)
        return false
      }

      return !!data
    } catch (err) {
      console.error('Error in isAdmin check:', err)
      return false
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkUser,
    isAdmin
  }
}