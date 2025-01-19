export default defineNuxtRouteMiddleware((to) => {
    // Pokud jsme na client-side
    if (process.client) {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        // Pokud nejsme přihlášení a nejsme na login stránce
        if (!isAdmin && to.path.startsWith('/admin') && to.path !== '/admin/login') {
            return navigateTo('/admin/login');
        }

        // Pokud jsme přihlášení a jsme na login stránce
        if (isAdmin && to.path === '/admin/login') {
            return navigateTo('/admin');
        }
    }
});