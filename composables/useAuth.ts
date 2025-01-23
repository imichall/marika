import { ref, computed } from 'vue'
import { useSupabaseClient } from '~/utils/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Check current session
  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      user.value = session?.user ?? null
    } catch (err: any) {
      console.error('Error checking auth status:', err)
      error.value = err.message
      user.value = null
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
      return true
    } catch (err: any) {
      console.error('Error logging in:', err)
      error.value = err.message
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

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkUser,
  }
}