import { ref } from 'vue'
import { useSupabaseClient } from '~/utils/supabase'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = ref(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // Kontrola aktuální session
  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      if (session?.user) {
        user.value = session.user
        isAuthenticated.value = true
      }
    } catch (err) {
      console.error('Error checking auth status:', err)
      error.value = err.message
    }
  }

  // Přihlášení
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
    } catch (err) {
      console.error('Error logging in:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Odhlášení
  const logout = async () => {
    try {
      loading.value = true
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      user.value = null
      isAuthenticated.value = false
    } catch (err) {
      console.error('Error logging out:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Kontrola při inicializaci
  if (process.client) {
    checkUser()

    // Sledování změn v autentizaci
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        user.value = session.user
        isAuthenticated.value = true
      } else {
        user.value = null
        isAuthenticated.value = false
      }
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