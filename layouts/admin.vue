<template>
  <div class="min-h-screen">
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
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
import { useAuth } from "~/composables/useAuth";
import { useRouter } from "vue-router";
import { useSupabaseClient } from "#imports";
import ToastNotifications from "~/components/ToastNotifications.vue";

const { user, checkUser } = useAuth();
const router = useRouter();
const supabase = useSupabaseClient();
const isAuthenticated = ref(false);

onMounted(async () => {
  await checkUser();

  if (!user.value) {
    router.push("/admin/login");
    return;
  }

  // Kontrola, zda je uživatel v user_roles tabulce a má roli admin nebo editor
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
    console.error("Uživatel není administrátor:", user.value.email);
    router.push("/admin/login");
    return;
  }

  isAuthenticated.value = true;
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
    }
  }
);
</script>