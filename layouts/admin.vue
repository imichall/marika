<template>
  <div class="min-h-screen">
    <AdminNavigation v-if="isAuthenticated" />
    <main v-if="isAuthenticated" class="pt-16">
      <div class="container mx-auto px-4">
        <slot />
        <AdminChat v-if="hasChatAccess" />
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
import AdminChat from "~/components/AdminChat.vue";

const { user, checkUser } = useAuth();
const router = useRouter();
const supabase = useSupabaseClient();
const isAuthenticated = ref(false);
const hasChatAccess = ref(false);
const permissions = ref({
  chat: {
    view: false,
  },
  // ... existing permissions ...
});

// Kontrola přístupu k chatu
const checkChatAccess = async () => {
  try {
    if (!user.value?.email) {
      console.log("No user email");
      return;
    }
    console.log("Checking access for user:", user.value.email);

    // Kontrola, zda je uživatel v chat_users tabulce
    const { data: chatUser, error: chatError } = await supabase
      .from("chat_users")
      .select("*")
      .eq("email", user.value.email)
      .single();

    if (chatError) {
      console.error("Error checking chat_users:", chatError);
      // Přidáme detailní výpis chyby
      console.error("Chat users query failed:", {
        error: chatError,
        email: user.value.email,
        query:
          "SELECT * FROM chat_users WHERE email = '" + user.value.email + "'",
      });
    }

    // Přidáme více informací o výsledku
    console.log("Chat user query result:", {
      rawData: chatUser,
      exists: !!chatUser,
      userEmail: user.value.email,
    });

    // Kontrola RLS politik
    const { data: policies, error: policyError } = await supabase
      .from("chat_users")
      .select("*");

    console.log("All chat users (RLS check):", {
      data: policies,
      error: policyError,
    });

    // Získání role ID
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("id, role")
      .eq("email", user.value.email)
      .single();

    if (roleError) {
      console.error("Error getting role:", roleError);
      return;
    }
    console.log("User role data:", roleData);

    // Kontrola oprávnění pro zobrazení chatu
    const { data: userPermissions, error: permError } = await supabase
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
      .eq("role_id", roleData.id);

    if (permError) {
      console.error("Error getting permissions:", permError);
    }
    console.log("User permissions raw data:", userPermissions);

    // Nastavíme oprávnění pro chat
    const hasViewPermission = userPermissions?.some(
      (permission) =>
        permission.permissions.section === "chat" &&
        permission.permissions.action === "view"
    );

    const hasManagePermission = userPermissions?.some(
      (permission) =>
        permission.permissions.section === "chat" &&
        permission.permissions.action === "manage"
    );

    console.log("Has view permission:", hasViewPermission);
    console.log("Has manage permission:", hasManagePermission);

    // Chat se zobrazí pouze pokud má uživatel oprávnění k zobrazení A je v seznamu uživatelů chatu
    const shouldHaveAccess = !!chatUser && hasViewPermission;
    console.log("Should have access calculation:", {
      chatUserExists: !!chatUser,
      hasViewPermission,
      finalResult: shouldHaveAccess,
    });

    hasChatAccess.value = shouldHaveAccess;
    console.log("Final chat access:", hasChatAccess.value);

    // Nastavíme oprávnění pro zobrazení a správu chatu
    permissions.value.chat = {
      view: hasViewPermission,
      manage: hasManagePermission,
    };
    console.log("Final permissions state:", permissions.value);
  } catch (err) {
    console.error("Error checking chat access:", err);
    hasChatAccess.value = false;
  }
};

onMounted(async () => {
  await checkUser();

  if (!user.value) {
    router.push("/admin/login");
    return;
  }

  // Nejdřív zkontrolujeme přístup k chatu
  await checkChatAccess();

  // Kontrola role pouze pokud uživatel nemá přístup k chatu
  if (!hasChatAccess.value) {
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
      hasChatAccess.value = false;
      return;
    }

    // Nejdřív zkontrolujeme přístup k chatu
    await checkChatAccess();

    // Kontrola role pouze pokud uživatel nemá přístup k chatu
    if (!hasChatAccess.value) {
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
    } else {
      isAuthenticated.value = true;
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