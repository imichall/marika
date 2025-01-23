export default defineNuxtRouteMiddleware((to) => {
  // Pokud nejsme v admin sekci, nepotřebujeme UI komponenty
  if (!to.path.startsWith('/admin')) {
    return;
  }

  // Zde můžeme přidat další logiku pro admin sekci
});