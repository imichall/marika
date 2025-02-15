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
    <div
      class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6 transition-all duration-200 hover:shadow-md"
    >
      <div class="flex flex-col space-y-4">
        <!-- Horní řada filtrů -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="relative">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 flex items-center"
            >
              <span class="material-icons-outlined text-violet-400 mr-2 text-lg"
                >category</span
              >
              Sekce
            </label>
            <div class="relative group">
              <select
                v-model="filters.section"
                class="w-full pl-3 pr-10 py-2.5 text-base border border-gray-200 focus:border-violet-500 focus:ring focus:ring-violet-200 rounded-lg transition-all duration-200 bg-gray-50 group-hover:bg-white"
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
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
              >
                <span
                  class="material-icons-outlined text-xl transition-transform duration-200 group-hover:text-violet-500"
                  >expand_more</span
                >
              </div>
            </div>
          </div>

          <div class="relative">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 flex items-center"
            >
              <span class="material-icons-outlined text-violet-400 mr-2 text-lg"
                >edit_note</span
              >
              Akce
            </label>
            <div class="relative group">
              <select
                v-model="filters.action"
                class="w-full pl-3 pr-10 py-2.5 text-base border border-gray-200 focus:border-violet-500 focus:ring focus:ring-violet-200 rounded-lg transition-all duration-200 bg-gray-50 group-hover:bg-white"
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
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
              >
                <span
                  class="material-icons-outlined text-xl transition-transform duration-200 group-hover:text-violet-500"
                  >expand_more</span
                >
              </div>
            </div>
          </div>

          <div class="relative">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 flex items-center"
            >
              <span class="material-icons-outlined text-violet-400 mr-2 text-lg"
                >person</span
              >
              Uživatel
            </label>
            <div class="relative group">
              <select
                v-model="filters.user_email"
                class="w-full pl-3 pr-10 py-2.5 text-base border border-gray-200 focus:border-violet-500 focus:ring focus:ring-violet-200 rounded-lg transition-all duration-200 bg-gray-50 group-hover:bg-white"
              >
                <option value="">Všichni uživatelé</option>
                <option
                  v-for="email in uniqueUsers"
                  :key="email"
                  :value="email"
                >
                  {{ email }}
                </option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
              >
                <span
                  class="material-icons-outlined text-xl transition-transform duration-200 group-hover:text-violet-500"
                  >expand_more</span
                >
              </div>
            </div>
          </div>

          <div class="relative">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 flex items-center"
            >
              <span class="material-icons-outlined text-violet-400 mr-2 text-lg"
                >calendar_today</span
              >
              Období
            </label>
            <div class="relative group">
              <select
                v-model="selectedPeriod"
                class="w-full pl-3 pr-10 py-2.5 text-base border border-gray-200 focus:border-violet-500 focus:ring focus:ring-violet-200 rounded-lg transition-all duration-200 bg-gray-50 group-hover:bg-white"
              >
                <option value="all">Celé období</option>
                <option value="today">Dnes</option>
                <option value="yesterday">Včera</option>
                <option value="week">Tento týden</option>
                <option value="month">Tento měsíc</option>
                <option value="custom">Vlastní období</option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
              >
                <span
                  class="material-icons-outlined text-xl transition-transform duration-200 group-hover:text-violet-500"
                  >expand_more</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Vlastní období -->
        <div
          v-if="selectedPeriod === 'custom'"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 flex items-center"
            >
              <span class="material-icons-outlined text-violet-400 mr-2 text-lg"
                >event</span
              >
              Od
            </label>
            <input
              v-model="filters.from_date"
              type="date"
              class="w-full px-3 py-2.5 border border-gray-200 focus:border-violet-500 focus:ring focus:ring-violet-200 rounded-lg transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-2 flex items-center"
            >
              <span class="material-icons-outlined text-violet-400 mr-2 text-lg"
                >event</span
              >
              Do
            </label>
            <input
              v-model="filters.to_date"
              type="date"
              class="w-full px-3 py-2.5 border border-gray-200 focus:border-violet-500 focus:ring focus:ring-violet-200 rounded-lg transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Seznam záznamů -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Nastavení počtu záznamů na stránku -->
      <div
        class="px-6 py-4 border-b border-gray-200 flex justify-between items-center"
      >
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">Zobrazit:</span>
          <select
            v-model="itemsPerPage"
            class="border-gray-300 rounded-md text-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <span class="text-sm text-gray-600">záznamů</span>
        </div>
        <div class="text-sm text-gray-600">
          Celkem: {{ totalItems }} záznamů
        </div>
      </div>

      <!-- Tabulka -->
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
          <tr
            v-for="log in paginatedLogs"
            :key="log.id"
            @click="openDiffModal(log)"
            class="hover:bg-violet-50 cursor-pointer transition-colors duration-150"
          >
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
              <div class="flex items-center">
                <span class="truncate max-w-sm">{{
                  getDetailsPreview(log.details)
                }}</span>
                <span
                  class="material-icons-outlined text-violet-400 ml-2 text-lg"
                  >chevron_right</span
                >
              </div>
            </td>
          </tr>
          <tr v-if="paginatedLogs.length === 0">
            <td
              :colspan="tableHeaders.length"
              class="px-6 py-4 text-center text-gray-500"
            >
              Nebyly nalezeny žádné záznamy
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Stránkování -->
      <div
        class="px-6 py-4 border-t border-gray-200 flex justify-between items-center"
      >
        <div class="text-sm text-gray-600">Zobrazeno {{ paginationInfo }}</div>
        <div class="flex space-x-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="material-icons-outlined text-lg">chevron_left</span>
          </button>
          <div class="flex space-x-1">
            <button
              v-for="page in displayedPages"
              :key="page"
              @click="changePage(page)"
              :class="[
                'px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500',
                currentPage === page
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-700 hover:bg-gray-50',
              ]"
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="material-icons-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>
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

    <!-- Modal pro zobrazení změn -->
    <TransitionRoot appear :show="showDiffModal" as="template">
      <Dialog as="div" @close="showDiffModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
          />
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
                class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all"
              >
                <div class="flex justify-between items-center mb-6">
                  <DialogTitle
                    as="h3"
                    class="text-lg font-medium leading-6 text-gray-900"
                  >
                    Detail změn
                  </DialogTitle>
                  <button
                    @click="showDiffModal = false"
                    class="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span class="material-icons-outlined">close</span>
                  </button>
                </div>

                <div v-if="selectedLog" class="space-y-6">
                  <!-- Metadata -->
                  <div
                    class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg text-sm"
                  >
                    <div>
                      <span class="block text-gray-500 text-xs uppercase"
                        >Sekce</span
                      >
                      <span class="font-medium">{{ selectedLog.section }}</span>
                    </div>
                    <div>
                      <span class="block text-gray-500 text-xs uppercase"
                        >Akce</span
                      >
                      <span
                        class="inline-flex px-2 text-xs font-semibold rounded-full"
                        :class="getActionClass(selectedLog.action)"
                      >
                        {{ selectedLog.action }}
                      </span>
                    </div>
                    <div>
                      <span class="block text-gray-500 text-xs uppercase"
                        >Uživatel</span
                      >
                      <span class="font-medium">{{
                        selectedLog.user_email
                      }}</span>
                    </div>
                    <div>
                      <span class="block text-gray-500 text-xs uppercase"
                        >Datum a čas</span
                      >
                      <span class="font-medium">{{
                        formatDate(selectedLog.created_at)
                      }}</span>
                    </div>
                  </div>

                  <!-- Diff view -->
                  <div class="space-y-4">
                    <template v-if="selectedLog.action === 'update'">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Původní stav -->
                        <div
                          class="bg-red-50 p-4 rounded-lg border border-red-100"
                        >
                          <h4
                            class="font-medium text-red-700 mb-2 flex items-center"
                          >
                            <span
                              class="material-icons-outlined mr-2 text-red-400"
                              >history</span
                            >
                            Původní stav
                          </h4>
                          <pre
                            class="whitespace-pre-wrap text-sm text-red-900 font-mono"
                            >{{ formatOldState(selectedLog.details) }}</pre
                          >
                        </div>
                        <!-- Nový stav -->
                        <div
                          class="bg-green-50 p-4 rounded-lg border border-green-100"
                        >
                          <h4
                            class="font-medium text-green-700 mb-2 flex items-center"
                          >
                            <span
                              class="material-icons-outlined mr-2 text-green-400"
                              >update</span
                            >
                            Nový stav
                          </h4>
                          <pre
                            class="whitespace-pre-wrap text-sm text-green-900 font-mono"
                            >{{ formatNewState(selectedLog.details) }}</pre
                          >
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div
                        class="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <h4
                          class="font-medium text-gray-700 mb-2 flex items-center"
                        >
                          <span
                            class="material-icons-outlined mr-2 text-gray-400"
                            >info</span
                          >
                          Detaily
                        </h4>
                        <pre class="whitespace-pre-wrap text-sm font-mono">{{
                          formatDetails(selectedLog.details)
                        }}</pre>
                      </div>
                    </template>
                  </div>
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

  // Pro objednávky
  if (details.order_id) {
    const lines = [];
    lines.push(`Objednávka #${details.order_id}`);

    if (details.změny) {
      if (details.změny.původní_stav !== undefined) {
        lines.push(
          `Původní stav: ${translateOrderState(details.změny.původní_stav)}`
        );
      }
      if (details.změny.nový_stav !== undefined) {
        lines.push(
          `Nový stav: ${translateOrderState(details.změny.nový_stav)}`
        );
      }
      if (details.změny.původní_částka !== undefined) {
        lines.push(`Původní částka: ${details.změny.původní_částka} Kč`);
      }
      if (details.změny.nová_částka !== undefined) {
        lines.push(`Nová částka: ${details.změny.nová_částka} Kč`);
      }
    } else {
      if (details.payment_status) {
        lines.push(`Stav: ${translateOrderState(details.payment_status)}`);
      }
      if (details.total_price !== undefined) {
        lines.push(`Částka: ${details.total_price} Kč`);
      }
    }

    return lines.join("\n");
  }

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

// Přidání nových proměnných a funkcí do <script setup>
const showDiffModal = ref(false);
const selectedLog = ref(null);

const openDiffModal = (log) => {
  selectedLog.value = log;
  showDiffModal.value = true;
};

// Překlad stavů objednávek
const translateOrderState = (state: string) => {
  const states = {
    pending: "Čeká na platbu",
    paid: "Zaplaceno",
    cancelled: "Zrušeno",
    refunded: "Vráceno",
  };
  return states[state] || state;
};

// Formátování hodnoty pro zobrazení
const formatValue = (key: string, value: any) => {
  if (key === "stav") return translateOrderState(value);
  if (typeof value === "number" && key.includes("částka")) return `${value} Kč`;
  if (value === null || value === undefined) return "-";
  return value;
};

const getDetailsPreview = (details) => {
  if (!details) return "";

  // Pro objednávky
  if (details.order_id) {
    const parts = [`Objednávka #${details.order_id}`];

    // Pro update akce
    if (details.changes) {
      if (details.changes.nový_stav !== undefined) {
        parts.push(`stav: ${translateOrderState(details.changes.nový_stav)}`);
      }
      if (details.changes.nová_částka !== undefined) {
        parts.push(`částka: ${details.changes.nová_částka} Kč`);
      }
    }
    // Pro create akce
    else if (details.payment_status !== undefined) {
      parts.push(`stav: ${translateOrderState(details.payment_status)}`);
      if (details.total_price !== undefined) {
        parts.push(`částka: ${details.total_price} Kč`);
      }
    }
    // Pro delete akce
    else if (details.stav !== undefined) {
      parts.push(`stav: ${translateOrderState(details.stav)}`);
      if (details.celková_částka !== undefined) {
        parts.push(`částka: ${details.celková_částka} Kč`);
      }
    }

    return parts.join(" - ");
  }

  // Pro ostatní záznamy
  const preview = JSON.stringify(details).slice(0, 100);
  return preview.length > 100 ? preview + "..." : preview;
};

const formatOldState = (details) => {
  if (!details) return "";

  // Pro objednávky
  if (details.order_id) {
    const lines = [];

    // Pro update akce
    if (details.changes) {
      if (details.changes.původní_stav !== undefined) {
        lines.push(
          `Stav: ${translateOrderState(details.changes.původní_stav)}`
        );
      }
      if (details.changes.původní_částka !== undefined) {
        lines.push(`Částka: ${details.changes.původní_částka} Kč`);
      }
    }
    // Pro delete akce
    else if (details.stav !== undefined) {
      lines.push(`Stav: ${translateOrderState(details.stav)}`);
      if (details.celková_částka !== undefined) {
        lines.push(`Částka: ${details.celková_částka} Kč`);
      }
      if (details.jméno_zákazníka) {
        lines.push(`Jméno: ${details.jméno_zákazníka}`);
      }
      if (details.email_zákazníka) {
        lines.push(`Email: ${details.email_zákazníka}`);
      }
    }

    return lines.join("\n");
  }

  // Pro ostatní záznamy
  return JSON.stringify(details, null, 2);
};

const formatNewState = (details) => {
  if (!details) return "";

  // Pro objednávky
  if (details.order_id) {
    const lines = [];

    // Pro update akce
    if (details.changes) {
      if (details.changes.nový_stav !== undefined) {
        lines.push(`Stav: ${translateOrderState(details.changes.nový_stav)}`);
      }
      if (details.changes.nová_částka !== undefined) {
        lines.push(`Částka: ${details.changes.nová_částka} Kč`);
      }
    }
    // Pro create akce
    else if (details.payment_status !== undefined) {
      lines.push(`Stav: ${translateOrderState(details.payment_status)}`);
      if (details.total_price !== undefined) {
        lines.push(`Částka: ${details.total_price} Kč`);
      }
      if (details.customer_name) {
        lines.push(`Jméno: ${details.customer_name}`);
      }
      if (details.customer_email) {
        lines.push(`Email: ${details.customer_email}`);
      }
    }

    return lines.join("\n");
  }

  // Pro ostatní záznamy
  return JSON.stringify(details, null, 2);
};

// Přidání nových proměnných a funkcí do <script setup>
const itemsPerPage = ref(10);
const currentPage = ref(1);

// Výpočet stránkování
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredLogs.value.slice(start, end);
});

const totalItems = computed(() => filteredLogs.value.length);
const totalPages = computed(() =>
  Math.ceil(totalItems.value / itemsPerPage.value)
);

const displayedPages = computed(() => {
  const pages = [];
  const maxPages = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  let end = Math.min(totalPages.value, start + maxPages - 1);

  if (end - start + 1 < maxPages) {
    start = Math.max(1, end - maxPages + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1;
  const end = Math.min(start + itemsPerPage.value - 1, totalItems.value);
  return `${start}-${end} z ${totalItems.value}`;
});

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Resetování stránky při změně filtrů
watch([filters, itemsPerPage], () => {
  currentPage.value = 1;
});
</script>