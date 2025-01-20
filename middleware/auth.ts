export default defineNuxtRouteMiddleware(async (to) => {
  if (process.client) {
    const { user, checkUser } = useAuth()

    // Zkontrolujeme aktuální session
    await checkUser()

    if (!user.value && to.path.startsWith('/admin') && to.path !== '/admin/login') {
      return navigateTo('/admin/login')
    }

    if (user.value && to.path === '/admin/login') {
      return navigateTo('/admin')
    }
  }
})