<template>
  <div v-if="isAuthenticated" class="fixed top-0 right-0 p-4 z-50 admin-menu">
    <div class="relative">
      <!-- Admin menu dropdown -->
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5"
      >
        <NuxtLink
          to="/admin/koncerty"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Správa koncertů
        </NuxtLink>
        <NuxtLink
          to="/admin/skupiny"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Správa skupin
        </NuxtLink>
        <NuxtLink
          to="/admin/galerie"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Správa galerie
        </NuxtLink>
        <NuxtLink
          to="/admin/reference"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Správa referencí
        </NuxtLink>
        <NuxtLink
          to="/admin/kontakty"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Správa kontaktů
        </NuxtLink>
        <NuxtLink
          v-if="currentUserRole === 'admin'"
          to="/admin/opravneni"
          class="hover:bg-gray-100 px-4 py-2 block"
        >
          Oprávnění
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useSupabaseClient } from "#imports";

const { isAuthenticated } = useAuth();
const isOpen = ref(false);
const currentUserRole = ref("viewer");

// Načtení role uživatele
const fetchUserRole = async () => {
  try {
    const supabase = useSupabaseClient();
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("email", user.data.user.email)
      .single();

    if (error) throw error;
    currentUserRole.value = data.role;
  } catch (err) {
    console.error("Error fetching user role:", err);
  }
};

// Zavřít menu při kliknutí mimo
onMounted(() => {
  fetchUserRole();
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!target.closest(".admin-menu")) {
      isOpen.value = false;
    }
  });
});
</script>