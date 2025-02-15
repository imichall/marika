import { ref, computed } from 'vue'
import { useSupabaseClient } from '#imports'
import { useSupabaseUser } from '#imports'
import type { User as SupabaseUser } from '@supabase/supabase-js'

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
  const autoLogoutTimer = ref<NodeJS.Timeout | null>(null)
  const DEFAULT_TIMEOUT = 30 * 60 * 1000 // 30 minut v milisekundách

  // Resetuje časovač pro automatické odhlášení
  const resetAutoLogoutTimer = () => {
    if (autoLogoutTimer.value) {
      clearTimeout(autoLogoutTimer.value)
    }

    // Skip auto-logout if we're in admin section
    if (process.client && window.location.pathname.startsWith('/admin')) {
      return
    }

    if (isAuthenticated.value) {
      autoLogoutTimer.value = setTimeout(() => {
        logout()
      }, DEFAULT_TIMEOUT)
    }
  }

  // Přidání event listenerů pro sledování aktivity
  const setupActivityListeners = () => {
    if (process.client) {
      ['mousedown', 'keydown', 'mousemove', 'touchstart'].forEach(eventName => {
        window.addEventListener(eventName, resetAutoLogoutTimer)
      })
    }
  }

  // Odstranění event listenerů
  const cleanupActivityListeners = () => {
    if (process.client) {
      ['mousedown', 'keydown', 'mousemove', 'touchstart'].forEach(eventName => {
        window.removeEventListener(eventName, resetAutoLogoutTimer)
      })
      if (autoLogoutTimer.value) {
        clearTimeout(autoLogoutTimer.value)
      }
    }
  }

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
      setupActivityListeners()
      resetAutoLogoutTimer()
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
      cleanupActivityListeners()
    } catch (err: any) {
      console.error('Error logging out:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Initialize auth state
  if (process.client) {
    checkUser().then(user => {
      if (user) {
        setupActivityListeners()
        resetAutoLogoutTimer()
      }
    })

    // Watch for auth state changes
    supabase.auth.onAuthStateChange((event: string, session: any) => {
      user.value = session?.user ?? null
      if (!session?.user) {
        cleanupActivityListeners()
      }
    })
  }

  const isAdmin = async () => {
    if (!user.value?.email) return false;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', user.value.email)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data?.role === 'admin';
    } catch (err) {
      console.error('Error in isAdmin check:', err);
      return false;
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