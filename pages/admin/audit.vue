<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Auditní záznamy</h1>
      <button
        v-if="permissions.manage"
        @click="showConfigModal = true"
        class="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700"
      >
        <span class="material-icons-outlined mr-2">settings</span>
        Konfigurace
      </button>
    </div>

    <!-- Filtry -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Sekce
          </label>
          <select
            v-model="filters.section"
            class="w-full border-gray-300 rounded-md shadow-sm focus:border-violet-500 focus:ring-violet-500"
          >
            <option value="">Všechny sekce</option>
            <option
              v-for="section in uniqueSections"
              :key="section"
              :value="section"
            >
              {{ section }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Akce
          </label>
          <select
            v-model="filters.action"
            class="w-full border-gray-300 rounded-md shadow-sm focus:border-violet-500 focus:ring-violet-500"
          >
            <option value="">Všechny akce</option>
            <option
              v-for="action in uniqueActions"
              :key="action"
              :value="action"
            >
              {{ action }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Uživatel
          </label>
          <select
            v-model="filters.user_email"
            class="w-full border-gray-300 rounded-md shadow-sm focus:border-violet-500 focus:ring-violet-500"
          >
            <option value="">Všichni uživatelé</option>
            <option v-for="email in uniqueUsers" :key="email" :value="email">
              {{ email }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Období
          </label>
          <select
            v-model="selectedPeriod"
            class="w-full border-gray-300 rounded-md shadow-sm focus:border-violet-500 focus:ring-violet-500"
          >
            <option value="all">Celé období</option>
            <option value="today">Dnes</option>
            <option value="yesterday">Včera</option>
            <option value="week">Tento týden</option>
            <option value="month">Tento měsíc</option>
            <option value="custom">Vlastní období</option>
          </select>
        </div>
      </div>

      <!-- Vlastní období -->
      <div
        v-if="selectedPeriod === 'custom'"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Od
          </label>
          <input
            v-model="filters.from_date"
            type="date"
            class="w-full border-gray-300 rounded-md shadow-sm focus:border-violet-500 focus:ring-violet-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Do
          </label>
          <input
            v-model="filters.to_date"
            type="date"
            class="w-full border-gray-300 rounded-md shadow-sm focus:border-violet-500 focus:ring-violet-500"
          />
        </div>
      </div>
    </div>

    <!-- Seznam záznamů -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="header in tableHeaders"
              :key="header.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ header.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="log in filteredLogs" :key="log.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(log.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ log.user_email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ log.section }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="getActionClass(log.action)"
              >
                {{ log.action }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ log.entity_id }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
              <pre class="whitespace-pre-wrap">{{
                formatDetails(log.details)
              }}</pre>
            </td>
          </tr>
          <tr v-if="filteredLogs.length === 0">
            <td
              :colspan="tableHeaders.length"
              class="px-6 py-4 text-center text-gray-500"
            >
              Nebyly nalezeny žádné záznamy
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal pro konfiguraci -->
    <TransitionRoot appear :show="showConfigModal" as="template">
      <Dialog as="div" @close="showConfigModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Konfigurace auditování
                </DialogTitle>

                <div class="mt-4 space-y-4">
                  <div
                    v-for="section in groupedConfig"
                    :key="section.name"
                    class="border-b pb-4"
                  >
                    <h4 class="font-medium text-gray-900 mb-2">
                      {{ section.name }}
                    </h4>
                    <div class="space-y-2">
                      <div
                        v-for="item in section.items"
                        :key="item.id"
                        class="flex items-center justify-between"
                      >
                        <span class="text-sm text-gray-600">{{
                          item.action
                        }}</span>
                        <Switch
                          v-model="item.is_enabled"
                          @change="updateConfigItem(item)"
                          class="relative inline-flex h-6 w-11 items-center rounded-full"
                          :class="
                            item.is_enabled ? 'bg-violet-600' : 'bg-gray-200'
                          "
                        >
                          <span class="sr-only">Povolit auditování</span>
                          <span
                            class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                            :class="
                              item.is_enabled
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            "
                          />
                        </Switch>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-6 flex justify-end">
                  <button
                    @click="showConfigModal = false"
                    class="bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                  >
                    Zavřít
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useAuditLogs } from "~/composables/useAuditLogs";
import { useSupabaseClient } from "#imports";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
  Switch,
} from "@headlessui/vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"],
});

const { logs, config, loading, error, fetchLogs, fetchConfig, updateConfig } =
  useAuditLogs();

const supabase = useSupabaseClient();
const showConfigModal = ref(false);

// Stav oprávnění
const permissions = ref({
  view: false,
  manage: false,
});

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    const actions = ["view", "manage"];
    for (const action of actions) {
      const { data: hasPermission } = await supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "audit",
        p_action: action,
      });
      permissions.value[action] = hasPermission;
    }
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

// Filtry
const filters = ref({
  section: "",
  action: "",
  user_email: "",
  from_date: "",
  to_date: "",
});

const selectedPeriod = ref("all");

// Sledování změn období
watch(selectedPeriod, (newValue) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  switch (newValue) {
    case "all":
      filters.value.from_date = "";
      filters.value.to_date = "";
      break;
    case "today":
      filters.value.from_date = today.toISOString().split("T")[0];
      filters.value.to_date = today.toISOString().split("T")[0];
      break;
    case "yesterday":
      filters.value.from_date = yesterday.toISOString().split("T")[0];
      filters.value.to_date = yesterday.toISOString().split("T")[0];
      break;
    case "week":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      filters.value.from_date = weekStart.toISOString().split("T")[0];
      filters.value.to_date = today.toISOString().split("T")[0];
      break;
    case "month":
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      filters.value.from_date = monthStart.toISOString().split("T")[0];
      filters.value.to_date = today.toISOString().split("T")[0];
      break;
  }
});

// Sledování změn filtrů
watch(
  filters,
  () => {
    fetchLogs({
      ...filters.value,
      from_date: filters.value.from_date
        ? new Date(filters.value.from_date)
        : undefined,
      to_date: filters.value.to_date
        ? new Date(filters.value.to_date)
        : undefined,
    });
  },
  { deep: true }
);

// Unikátní hodnoty pro filtry
const uniqueSections = computed(() => [
  ...new Set(logs.value.map((log) => log.section)),
]);
const uniqueActions = computed(() => [
  ...new Set(logs.value.map((log) => log.action)),
]);
const uniqueUsers = computed(() => [
  ...new Set(logs.value.map((log) => log.user_email)),
]);

// Filtrované záznamy
const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    if (filters.value.section && log.section !== filters.value.section)
      return false;
    if (filters.value.action && log.action !== filters.value.action)
      return false;
    if (filters.value.user_email && log.user_email !== filters.value.user_email)
      return false;

    if (filters.value.from_date) {
      const fromDate = new Date(filters.value.from_date);
      fromDate.setHours(0, 0, 0, 0);
      const logDate = new Date(log.created_at);
      if (logDate < fromDate) return false;
    }

    if (filters.value.to_date) {
      const toDate = new Date(filters.value.to_date);
      toDate.setHours(23, 59, 59, 999);
      const logDate = new Date(log.created_at);
      if (logDate > toDate) return false;
    }

    return true;
  });
});

// Seskupená konfigurace podle sekcí
const groupedConfig = computed(() => {
  const groups = {};
  config.value.forEach((item) => {
    if (!groups[item.section]) {
      groups[item.section] = {
        name: item.section,
        items: [],
      };
    }
    groups[item.section].items.push(item);
  });
  return Object.values(groups);
});

// Aktualizace konfigurace
const updateConfigItem = async (item) => {
  await updateConfig(item.id, item.is_enabled);
};

// Formátování data
const formatDate = (date: string) => {
  return new Date(date).toLocaleString("cs-CZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Formátování detailů
const formatDetails = (details: any) => {
  if (!details) return "";
  return JSON.stringify(details, null, 2);
};

// CSS třídy pro akce
const getActionClass = (action: string) => {
  switch (action) {
    case "create":
      return "bg-green-100 text-green-800";
    case "update":
      return "bg-blue-100 text-blue-800";
    case "delete":
      return "bg-red-100 text-red-800";
    case "approve":
      return "bg-violet-100 text-violet-800";
    case "reject":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Hlavičky tabulky
const tableHeaders = [
  { key: "created_at", label: "Datum a čas" },
  { key: "user_email", label: "Uživatel" },
  { key: "section", label: "Sekce" },
  { key: "action", label: "Akce" },
  { key: "entity_id", label: "ID entity" },
  { key: "details", label: "Detaily" },
];

// Inicializace
onMounted(async () => {
  await Promise.all([loadPermissions(), fetchLogs(), fetchConfig()]);
});
</script>