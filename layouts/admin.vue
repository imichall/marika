<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <AdminNavigation v-if="isAuthenticated" />
    <main v-if="isAuthenticated" class="pt-16">
      <div class="container mx-auto px-4">
        <slot />
      </div>
    </main>
    <ToastNotifications />
    <!-- <div v-else>
      <p>Přesměrování na přihlášení...</p>
    </div> -->
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth", "permission"],
});

import AdminNavigation from "~/components/AdminNavigation.vue";
import { useAuth } from "~/composables/useAuth";
import { useRouter } from "vue-router";
import { useSupabaseClient } from "#imports";
import ToastNotifications from "~/components/ToastNotifications.vue";

const { user, checkUser } = useAuth();
const router = useRouter();
const supabase = useSupabaseClient();
const isAuthenticated = ref(false);
const permissions = ref({
  // ... existing permissions ...
});

onMounted(async () => {
  await checkUser();

  if (!user.value) {
    router.push("/admin/login");
    return;
  }

  // Kontrola role uživatele
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("email", user.value.email)
    .single();

  if (
    roleError ||
    !userRole ||
    (userRole.role !== "admin" && userRole.role !== "editor")
  ) {
    console.error("Uživatel nemá potřebná oprávnění:", user.value.email);
    router.push("/admin/login");
    return;
  }

  isAuthenticated.value = true;
  await loadPermissions();
});

// Sledování změn v autentizaci
watch(
  () => user.value,
  async (newUser) => {
    if (!newUser) {
      router.push("/admin/login");
      isAuthenticated.value = false;
      return;
    }

    // Kontrola role uživatele
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("email", newUser.email)
      .single();

    isAuthenticated.value =
      !roleError &&
      userRole &&
      (userRole.role === "admin" || userRole.role === "editor");

    if (!isAuthenticated.value) {
      router.push("/admin/login");
      return;
    }

    await loadPermissions();
  }
);

const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    // Získání role uživatele
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("id, role")
      .eq("email", user.data.user.email)
      .single();

    // Pro adminy nastavíme všechna oprávnění na true
    if (userRole.role === "admin") {
      Object.keys(permissions.value).forEach((section) => {
        Object.keys(permissions.value[section]).forEach((action) => {
          permissions.value[section][action] = true;
        });
      });
      return;
    }

    // Pro ostatní role načteme oprávnění z databáze
    const { data: userPermissions } = await supabase
      .from("user_permissions")
      .select(
        `
        permission_id,
        permissions:permission_id (
          section,
          action
        )
      `
      )
      .eq("role_id", userRole.id);

    // Resetujeme všechna oprávnění na false
    Object.keys(permissions.value).forEach((section) => {
      Object.keys(permissions.value[section]).forEach((action) => {
        permissions.value[section][action] = false;
      });
    });

    // Nastavíme oprávnění podle dat z databáze
    userPermissions?.forEach((permission) => {
      const section = permission.permissions.section;
      const action = permission.permissions.action;
      if (permissions.value[section]) {
        permissions.value[section][action] = true;
      }
    });
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.5s ease-in forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>