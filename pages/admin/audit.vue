<template>
  <div class="w-full px-4 py-8 pb-20 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Auditní záznamy</h1>
      <button
        v-if="permissions.manage"
        @click="showConfigModal = true"
        class="flex bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 shadow-sm shadow-violet-500/30"
      >
        <span class="material-icons-outlined mr-2">settings</span>
        Konfigurace
      </button>
    </div>

    <!-- Filtry -->
    <div
      class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-all duration-200 hover:shadow-md dark:hover:shadow-lg/20"
    >
      <div class="flex flex-col space-y-4">
        <!-- Horní řada filtrů -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="relative">
            <label
              class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <span class="material-icons-outlined text-violet-400 mr-2 text-lg"
                >category</span
              >
              Sekce
            </label>
            <div class="relative group">
              <select
                v-model="filters.section"
                class="w-full pl-3 pr-10 py-2.5 text-base border border-gray-200 dark:border-gray-600 focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-400 rounded-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 group-hover:bg-white dark:group-hover:bg-gray-800 appearance-none"
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
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 dark:text-gray-500"
              >
                <span
                  class="material-icons-outlined text-xl transition-transform duration-200 group-hover:text-violet-500 dark:group-hover:text-violet-400"
                  >expand_more</span
                >
              </div>
            </div>
          </div>

          <div class="relative">
            <label
              class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <span class="material-icons-outlined text-violet-400 mr-2 text-lg"
                >edit_note</span
              >
              Akce
            </label>
            <div class="relative group">
              <select
                v-model="filters.action"
                class="w-full pl-3 pr-10 py-2.5 text-base border border-gray-200 dark:border-gray-600 focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-400 rounded-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 group-hover:bg-white dark:group-hover:bg-gray-800 appearance-none"
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
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 dark:text-gray-500"
              >
                <span
                  class="material-icons-outlined text-xl transition-transform duration-200 group-hover:text-violet-500 dark:group-hover:text-violet-400"
                  >expand_more</span
                >
              </div>
            </div>
          </div>

          <div class="relative">
            <label
              class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <span class="material-icons-outlined text-violet-400 mr-2 text-lg"
                >person</span
              >
              Uživatel
            </label>
            <div class="relative group">
              <select
                v-model="filters.user_email"
                class="w-full pl-3 pr-10 py-2.5 text-base border border-gray-200 dark:border-gray-600 focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-400 rounded-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 group-hover:bg-white dark:group-hover:bg-gray-800 appearance-none"
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
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 dark:text-gray-500"
              >
                <span
                  class="material-icons-outlined text-xl transition-transform duration-200 group-hover:text-violet-500 dark:group-hover:text-violet-400"
                  >expand_more</span
                >
              </div>
            </div>
          </div>

          <div class="relative">
            <label
              class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <span class="material-icons-outlined text-violet-400 mr-2 text-lg"
                >calendar_today</span
              >
              Období
            </label>
            <div class="relative group">
              <select
                v-model="selectedPeriod"
                class="w-full pl-3 pr-10 py-2.5 text-base border border-gray-200 dark:border-gray-600 focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-400 rounded-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 group-hover:bg-white dark:group-hover:bg-gray-800 appearance-none"
              >
                <option value="all">Celé období</option>
                <option value="today">Dnes</option>
                <option value="yesterday">Včera</option>
                <option value="week">Tento týden</option>
                <option value="month">Tento měsíc</option>
                <option value="custom">Vlastní období</option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 dark:text-gray-500"
              >
                <span
                  class="material-icons-outlined text-xl transition-transform duration-200 group-hover:text-violet-500 dark:group-hover:text-violet-400"
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
              class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <span class="material-icons-outlined text-violet-400 mr-2 text-lg"
                >event</span
              >
              Od
            </label>
            <input
              v-model="filters.from_date"
              type="date"
              class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-400 rounded-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-800"
            />
          </div>
          <div>
            <label
              class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <span class="material-icons-outlined text-violet-400 mr-2 text-lg"
                >event</span
              >
              Do
            </label>
            <input
              v-model="filters.to_date"
              type="date"
              class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-400 rounded-lg transition-all duration-200 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-800"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Seznam záznamů -->
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700">
      <!-- Nastavení počtu záznamů na stránku -->
      <div
        class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/60 dark:bg-gray-900"
      >
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600 dark:text-gray-300">Zobrazit:</span>
          <select
            v-model="itemsPerPage"
            class="border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:focus:border-violet-400 dark:focus:ring-violet-400 appearance-none pl-3 pr-8 py-1 bg-white dark:bg-gray-800 dark:text-gray-100"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <span class="text-sm text-gray-600 dark:text-gray-300">záznamů</span>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-300">
          Celkem: {{ totalItems }} záznamů
        </div>
      </div>

      <!-- Tabulka -->
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              v-for="header in tableHeaders"
              :key="header.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              {{ header.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="log in paginatedLogs"
            :key="log.id"
            @click="openDiffModal(log)"
            class="hover:bg-violet-50 dark:hover:bg-violet-500/10 cursor-pointer transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {{ formatDate(log.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {{ log.user_email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {{ log.entity_id }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
              <div class="flex items-center">
                <span class="truncate max-w-sm">{{
                  getDetailsPreview(log.details)
                }}</span>
                <span
                  class="material-icons-outlined text-violet-400 dark:text-violet-300 ml-2 text-lg"
                  >chevron_right</span
                >
              </div>
            </td>
          </tr>
          <tr v-if="paginatedLogs.length === 0">
            <td
              :colspan="tableHeaders.length"
              class="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
            >
              Nebyly nalezeny žádné záznamy
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Stránkování -->
      <div
        class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/60 dark:bg-gray-900"
      >
        <div class="text-sm text-gray-600 dark:text-gray-300">Zobrazeno {{ paginationInfo }}</div>
        <div class="flex space-x-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
              ]"
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
                class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4"
                >
                  Konfigurace auditování
                </DialogTitle>

                <div class="mt-4 space-y-4">
                  <div
                    v-for="section in groupedConfig"
                    :key="section.name"
                    class="border-b border-gray-200 dark:border-gray-700 pb-4"
                  >
                    <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {{ section.name }}
                    </h4>
                    <div class="space-y-2">
                      <div
                        v-for="item in section.items"
                        :key="item.id"
                        class="flex items-center justify-between"
                      >
                        <span class="text-sm text-gray-600 dark:text-gray-300">{{
                          item.action
                        }}</span>
                        <Switch
                          v-model="item.is_enabled"
                          @change="updateConfigItem(item)"
                          class="relative inline-flex h-6 w-11 items-center rounded-full"
                          :class="
                            item.is_enabled
                              ? 'bg-violet-600 dark:bg-violet-500'
                              : 'bg-gray-200 dark:bg-gray-700'
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
                    class="bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
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
                class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <div class="flex justify-between items-center mb-6">
                  <DialogTitle
                    as="h3"
                    class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Detail změn
                  </DialogTitle>
                  <button
                    @click="showDiffModal = false"
                    class="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <span class="material-icons-outlined">close</span>
                  </button>
                </div>

                <div v-if="selectedLog" class="space-y-6">
                  <!-- Metadata -->
                  <div
                    class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                  >
                    <div>
                      <span class="block text-gray-500 dark:text-gray-400 text-xs uppercase"
                        >Sekce</span
                      >
                      <span class="font-medium text-gray-900 dark:text-gray-100">{{ selectedLog.section }}</span>
                    </div>
                    <div>
                      <span class="block text-gray-500 dark:text-gray-400 text-xs uppercase"
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
                      <span class="block text-gray-500 dark:text-gray-400 text-xs uppercase"
                        >Uživatel</span
                      >
                      <span class="font-medium text-gray-900 dark:text-gray-100">{{
                        selectedLog.user_email
                      }}</span>
                    </div>
                    <div>
                      <span class="block text-gray-500 dark:text-gray-400 text-xs uppercase"
                        >Datum a čas</span
                      >
                      <span class="font-medium text-gray-900 dark:text-gray-100">{{
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
                          class="bg-red-50 dark:bg-red-500/10 p-4 rounded-lg border border-red-100 dark:border-red-500/40"
                        >
                          <h4
                            class="font-medium text-red-700 dark:text-red-300 mb-2 flex items-center"
                          >
                            <span
                              class="material-icons-outlined mr-2 text-red-400 dark:text-red-300"
                              >history</span
                            >
                            Původní stav
                          </h4>
                          <pre
                            class="whitespace-pre-wrap text-sm text-red-900 dark:text-red-200 font-mono"
                            >{{ formatOldState(selectedLog.details) }}</pre
                          >
                        </div>
                        <!-- Nový stav -->
                        <div
                          class="bg-green-50 dark:bg-green-500/10 p-4 rounded-lg border border-green-100 dark:border-green-500/40"
                        >
                          <h4
                            class="font-medium text-green-700 dark:text-green-300 mb-2 flex items-center"
                          >
                            <span
                              class="material-icons-outlined mr-2 text-green-400 dark:text-green-300"
                              >update</span
                            >
                            Nový stav
                          </h4>
                          <pre
                            class="whitespace-pre-wrap text-sm text-green-900 dark:text-green-200 font-mono"
                            >{{ formatNewState(selectedLog.details) }}</pre
                          >
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div
                        class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <h4
                          class="font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center"
                        >
                          <span
                            class="material-icons-outlined mr-2 text-gray-400 dark:text-gray-500"
                            >info</span
                          >
                          Detaily
                        </h4>
                        <pre class="whitespace-pre-wrap text-sm font-mono text-gray-900 dark:text-gray-100">{{
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
import type { AuditLog, AuditConfig } from "~/composables/useAuditLogs";
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
const permissionActions = ["view", "manage"] as const;
type AuditPermissionAction = (typeof permissionActions)[number];

const permissions = ref<Record<AuditPermissionAction, boolean>>({
  view: false,
  manage: false,
});

type AuditDetails = Record<string, any> | null | undefined;

type GroupedConfigSection = {
  name: string;
  items: AuditConfig[];
};

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    for (const action of permissionActions) {
      const { data: hasPermission } = await supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "audit",
        p_action: action,
      });
      permissions.value[action] = !!hasPermission;
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

// Přidání konstanty pro aktuální rok
const CURRENT_YEAR = 2025;

// Sledování změn filtrů
watch(
  filters,
  () => {
    // Převedeme datum na UTC pro server
    const fromDate = filters.value.from_date
      ? new Date(filters.value.from_date + "T00:00:00Z")
      : undefined;
    const toDate = filters.value.to_date
      ? new Date(filters.value.to_date + "T23:59:59Z")
      : undefined;

    fetchLogs({
      ...filters.value,
      from_date: fromDate,
      to_date: toDate,
    });
  },
  { deep: true }
);

// Filtrované záznamy
const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    if (filters.value.section && log.section !== filters.value.section)
      return false;
    if (filters.value.action && log.action !== filters.value.action)
      return false;
    if (filters.value.user_email && log.user_email !== filters.value.user_email)
      return false;

    if (filters.value.from_date || filters.value.to_date) {
      const logDate = new Date(log.created_at);

      // Porovnáváme pouze rok, měsíc a den
      const logYear = logDate.getFullYear();
      const logMonth = logDate.getMonth();
      const logDay = logDate.getDate();

      if (filters.value.from_date) {
        const fromDate = new Date(filters.value.from_date);
        const fromYear = fromDate.getFullYear();
        const fromMonth = fromDate.getMonth();
        const fromDay = fromDate.getDate();

        // Porovnání data bez času
        const logDateValue = new Date(logYear, logMonth, logDay).getTime();
        const fromDateValue = new Date(fromYear, fromMonth, fromDay).getTime();

        if (logDateValue < fromDateValue) {
          return false;
        }
      }

      if (filters.value.to_date) {
        const toDate = new Date(filters.value.to_date);
        const toYear = toDate.getFullYear();
        const toMonth = toDate.getMonth();
        const toDay = toDate.getDate();

        // Porovnání data bez času
        const logDateValue = new Date(logYear, logMonth, logDay).getTime();
        const toDateValue = new Date(toYear, toMonth, toDay).getTime();

        if (logDateValue > toDateValue) {
          return false;
        }
      }
    }

    return true;
  });
});

// Sledování změn období
watch(selectedPeriod, (newValue) => {
  // Získáme aktuální den a měsíc, ale použijeme rok 2025
  const currentDate = new Date();
  const today = new Date(
    CURRENT_YEAR,
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const yesterday = new Date(
    CURRENT_YEAR,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  yesterday.setDate(yesterday.getDate() - 1);

  const weekStart = new Date(
    CURRENT_YEAR,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const monthStart = new Date(CURRENT_YEAR, currentDate.getMonth(), 1);

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
      filters.value.from_date = weekStart.toISOString().split("T")[0];
      filters.value.to_date = today.toISOString().split("T")[0];
      break;
    case "month":
      filters.value.from_date = monthStart.toISOString().split("T")[0];
      filters.value.to_date = today.toISOString().split("T")[0];
      break;
  }
});

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

// Seskupená konfigurace podle sekcí
const groupedConfig = computed<GroupedConfigSection[]>(() => {
  const groups: Record<string, GroupedConfigSection> = {};
  config.value.forEach((item: AuditConfig) => {
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
const updateConfigItem = async (item: AuditConfig) => {
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
const formatDetails = (details: AuditDetails) => {
  if (!details || typeof details !== "object") return "";
  const record = details as Record<string, any>;

  if (record.order_id) {
    const lines: string[] = [`Objednávka #${record.order_id}`];

    if (record.změny) {
      const changes = record.změny as Record<string, any>;
      if (changes.původní_stav !== undefined) {
        lines.push(
          `Původní stav: ${translateOrderState(changes.původní_stav)}`
        );
      }
      if (changes.nový_stav !== undefined) {
        lines.push(`Nový stav: ${translateOrderState(changes.nový_stav)}`);
      }
      if (changes.původní_částka !== undefined) {
        lines.push(`Původní částka: ${changes.původní_částka} Kč`);
      }
      if (changes.nová_částka !== undefined) {
        lines.push(`Nová částka: ${changes.nová_částka} Kč`);
      }
    } else {
      if (record.payment_status) {
        lines.push(`Stav: ${translateOrderState(record.payment_status)}`);
      }
      if (record.total_price !== undefined) {
        lines.push(`Částka: ${record.total_price} Kč`);
      }
    }

    return lines.join("\n");
  }

  return JSON.stringify(record, null, 2);
};

// CSS třídy pro akce
const getActionClass = (action: string) => {
  switch (action) {
    case "create":
      return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200";
    case "update":
      return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200";
    case "delete":
      return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200";
    case "approve":
      return "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200";
    case "reject":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-200";
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
const selectedLog = ref<AuditLog | null>(null);

const openDiffModal = (log: AuditLog) => {
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
  } as const;
  return states[state as keyof typeof states] ?? state;
};

// Formátování hodnoty pro zobrazení
const formatValue = (key: string, value: any) => {
  if (key === "stav") return translateOrderState(value);
  if (typeof value === "number" && key.includes("částka")) return `${value} Kč`;
  if (value === null || value === undefined) return "-";
  return value;
};

const getDetailsPreview = (details: AuditDetails) => {
  if (!details || typeof details !== "object") return "";
  const record = details as Record<string, any>;

  // Pro objednávky
  if (record.order_id) {
    const parts: string[] = [`Objednávka #${record.order_id}`];

    const updateChanges = (record.changes || record.změny) as
      | Record<string, any>
      | undefined;

    if (updateChanges) {
      if (updateChanges.nový_stav !== undefined) {
        parts.push(`stav: ${translateOrderState(updateChanges.nový_stav)}`);
      }
      if (updateChanges.nová_částka !== undefined) {
        parts.push(`částka: ${updateChanges.nová_částka} Kč`);
      }
    } else if (record.payment_status !== undefined) {
      parts.push(`stav: ${translateOrderState(record.payment_status)}`);
      if (record.total_price !== undefined) {
        parts.push(`částka: ${record.total_price} Kč`);
      }
    } else if (record.stav !== undefined) {
      parts.push(`stav: ${translateOrderState(record.stav)}`);
      if (record.celková_částka !== undefined) {
        parts.push(`částka: ${record.celková_částka} Kč`);
      }
    }

    return parts.join(" - ");
  }

  const preview = JSON.stringify(record).slice(0, 100);
  return preview.length > 100 ? preview + "..." : preview;
};

const formatOldState = (details: AuditDetails) => {
  if (!details || typeof details !== "object") return "";
  const record = details as Record<string, any>;

  if (record.order_id) {
    const lines: string[] = [];
    const changes = (record.changes || record.změny) as
      | Record<string, any>
      | undefined;

    if (changes) {
      Object.entries(changes).forEach(([key, value]) => {
        if (key.startsWith("původní_")) {
          const label = key.replace("původní_", "");
          lines.push(`${label}: ${value}`);
        }
      });
    } else if (record.stav !== undefined) {
      lines.push(`Stav: ${translateOrderState(record.stav)}`);
      if (record.celková_částka !== undefined) {
        lines.push(`Částka: ${record.celková_částka} Kč`);
      }
      if (record.jméno_zákazníka) {
        lines.push(`Jméno: ${record.jméno_zákazníka}`);
      }
      if (record.email_zákazníka) {
        lines.push(`Email: ${record.email_zákazníka}`);
      }
    }

    return lines.join("\n");
  }

  if (record.změny) {
    const lines: string[] = [];
    Object.entries(record.změny).forEach(([key, value]) => {
      if (key.startsWith("původní_")) {
        const label = key.replace("původní_", "");
        lines.push(`${label}: ${value}`);
      }
    });
    return lines.join("\n");
  }

  return JSON.stringify(record, null, 2);
};

const formatNewState = (details: AuditDetails) => {
  if (!details || typeof details !== "object") return "";
  const record = details as Record<string, any>;

  if (record.order_id) {
    const lines: string[] = [];
    const changes = (record.changes || record.změny) as
      | Record<string, any>
      | undefined;

    if (changes) {
      Object.entries(changes).forEach(([key, value]) => {
        if (key.startsWith("nový_")) {
          const label = key.replace("nový_", "");
          lines.push(`${label}: ${value}`);
        }
      });
    } else if (record.payment_status !== undefined) {
      lines.push(`Stav: ${translateOrderState(record.payment_status)}`);
      if (record.total_price !== undefined) {
        lines.push(`Částka: ${record.total_price} Kč`);
      }
      if (record.customer_name) {
        lines.push(`Jméno: ${record.customer_name}`);
      }
      if (record.customer_email) {
        lines.push(`Email: ${record.customer_email}`);
      }
    }

    return lines.join("\n");
  }

  if (record.změny) {
    const lines: string[] = [];
    Object.entries(record.změny).forEach(([key, value]) => {
      if (key.startsWith("nový_")) {
        const label = key.replace("nový_", "");
        lines.push(`${label}: ${value}`);
      }
    });
    return lines.join("\n");
  }

  return JSON.stringify(record, null, 2);
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