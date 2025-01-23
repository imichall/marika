<template>
  <div>
    <slot v-if="isAuthenticated">
      <Navigation />
      <div class="container mx-auto px-4 mt-[100px]">
        <!-- Breadcrumbs nad obsahem -->
        <AdminBreadcrumbs />

        <!-- Slot pro obsah podsekcí -->
        <slot />
      </div>
    </slot>
    <div v-else>
      <p>Přesměrování na přihlášení...</p>
    </div>
  </div>
</template>

<script setup>
import Navigation from "~/components/Navigation.vue";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
import { useAuth } from "~/composables/useAuth";
import { useRouter } from "vue-router";

const { user, checkUser } = useAuth();
const router = useRouter();
const isAuthenticated = ref(false);

onMounted(async () => {
  await checkUser();

  if (!user.value) {
    router.push("/admin/login");
    return;
  }

  // Kontrola, zda je uživatel v admin_users tabulce
  const supabase = useSupabaseClient();
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", user.value.email)
    .single();

  if (adminError || !adminUser) {
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

    const supabase = useSupabaseClient();
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", newUser.email)
      .single();

    isAuthenticated.value = !adminError && !!adminUser;
    if (!isAuthenticated.value) {
      router.push("/admin/login");
    }
  }
);
</script>