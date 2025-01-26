<template>
  <div class="container mx-auto px-4 space-y-8 mt-[100px]">
    <AdminBreadcrumbs />

    <!-- Nadpis -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Objednávky vstupenek</h1>
    </div>

    <!-- Taby -->
    <TabGroup
      as="div"
      :selected-index="selectedTab"
      @change="(index) => (selectedTab = index)"
      class="w-full"
    >
      <div class="border-b border-gray-200">
        <TabList class="flex -mb-px space-x-8">
          <Tab v-slot="{ selected }">
            <button
              class="py-4 px-1 border-b-2 font-medium text-sm outline-none whitespace-nowrap"
              :class="[
                selected
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              <div class="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Přehled a statistiky</span>
              </div>
            </button>
          </Tab>
          <Tab v-slot="{ selected }">
            <button
              class="py-4 px-1 border-b-2 font-medium text-sm outline-none whitespace-nowrap"
              :class="[
                selected
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              <div class="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Seznam objednávek</span>
              </div>
            </button>
          </Tab>
        </TabList>
      </div>

      <TabPanels class="mt-6">
        <!-- Panel pro přehled a statistiky -->
        <TabPanel>
          <div class="space-y-6">
            <!-- Dashboard statistiky -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-600">
                  Celkový počet objednávek
                </h3>
                <p class="text-3xl font-bold mt-2">{{ orders?.length || 0 }}</p>
                <div class="mt-2 text-sm text-gray-500 space-y-1">
                  <div>Čeká na platbu: {{ pendingOrders }}</div>
                  <div>Zaplaceno: {{ completedOrders }}</div>
                  <div>Zrušeno: {{ cancelledOrders }}</div>
                </div>
              </div>
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-600">
                  Celkový příjem
                </h3>
                <p class="text-3xl font-bold mt-2">{{ totalIncome }} Kč</p>
                <div class="mt-2 text-sm text-gray-500">
                  Průměrně {{ averageOrderValue }} Kč/objednávka
                </div>
              </div>
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-600">
                  Prodané vstupenky
                </h3>
                <p class="text-3xl font-bold mt-2">{{ totalTickets }}</p>
                <div class="mt-2 text-sm text-gray-500">
                  Průměrně {{ averageTicketsPerOrder }} ks/objednávka
                </div>
              </div>
            </div>

            <!-- Grafy statistik -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Graf příjmů -->
              <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-bold mb-4">Příjmy z prodeje</h2>
                <div class="h-[400px]">
                  <BarChart :data="incomeChartData" :options="chartOptions" />
                </div>
              </div>

              <!-- Graf prodaných vstupenek -->
              <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-bold mb-4">Prodané vstupenky</h2>
                <div class="h-[400px]">
                  <LineChart :data="ticketsChartData" :options="chartOptions" />
                </div>
              </div>

              <!-- Graf stavu objednávek -->
              <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-bold mb-4">Stav objednávek</h2>
                <div class="h-[400px]">
                  <DoughnutChart
                    :data="statusChartData"
                    :options="doughnutOptions"
                  />
                </div>
              </div>

              <!-- Graf rozložení nákupů -->
              <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-bold mb-4">
                  Rozložení nákupů během dne
                </h2>
                <div class="h-[400px]">
                  <BarChart
                    :data="hourlyDistributionData"
                    :options="chartOptions"
                  />
                </div>
              </div>

              <!-- Graf nejprodávanějších koncertů -->
              <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-bold mb-4">Nejprodávanější koncerty</h2>
                <div class="h-[400px]">
                  <BarChart
                    :data="concertsChartData"
                    :options="horizontalChartOptions"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- Panel pro seznam objednávek -->
        <TabPanel>
          <div class="space-y-4">
            <!-- Filtry -->
            <div
              class="bg-white p-4 rounded-lg border border-gray-200 space-y-4"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium">Filtry</h3>
                <button
                  @click="resetFilters"
                  class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Resetovat
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700"
                    >Vyhledat</label
                  >
                  <div class="relative">
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Jméno, email nebo koncert..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-gray-400 absolute right-3 top-2.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700"
                    >Status platby</label
                  >
                  <select
                    v-model="statusFilter"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Všechny statusy</option>
                    <option value="pending">Čeká na platbu</option>
                    <option value="completed">Zaplaceno</option>
                    <option value="cancelled">Zrušeno</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700"
                    >Řadit podle</label
                  >
                  <select
                    v-model="sortBy"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="date-desc">Nejnovější</option>
                    <option value="date-asc">Nejstarší</option>
                    <option value="price-desc">Nejvyšší cena</option>
                    <option value="price-asc">Nejnižší cena</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Seznam objednávek -->
            <div
              class="bg-white rounded-lg border border-gray-200 overflow-hidden h-[60vh]"
            >
              <div class="overflow-x-auto h-full relative">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Datum
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Zákazník
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Koncert
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Vstupenky
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Celkem
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Akce
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr
                      v-for="order in filteredOrders"
                      :key="order.id"
                      class="hover:bg-gray-50"
                    >
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                      >
                        <div class="text-sm font-medium text-gray-900">
                          {{ formatDate(order.created_at) }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ formatTime(order.created_at) }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">
                          {{ order.customer_name }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ order.customer_email }}
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-900">
                          {{ getConcertTitle(order.concert_id) }}
                        </div>
                        <div class="text-sm text-gray-500">
                          VS: {{ order.variable_symbol }}
                        </div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                      >
                        {{ order.ticket_count }} ks
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">
                          {{ order.total_price }} Kč
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span
                          :class="{
                            'px-2 py-1 text-xs font-medium rounded-md': true,
                            'bg-yellow-50 text-yellow-700 border border-yellow-200':
                              order.payment_status === 'pending',
                            'bg-green-50 text-green-700 border border-green-200':
                              order.payment_status === 'completed',
                            'bg-red-50 text-red-700 border border-red-200':
                              order.payment_status === 'cancelled',
                          }"
                        >
                          {{ getStatusLabel(order.payment_status) }}
                        </span>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-right text-sm"
                      >
                        <Menu as="div" class="relative inline-block text-left">
                          <MenuButton
                            class="p-1 rounded-full hover:bg-gray-100"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-5 w-5 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </MenuButton>
                          <transition
                            enter-active-class="transition ease-out duration-100"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-75"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95"
                          >
                            <MenuItems
                              class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                            >
                              <div class="py-1">
                                <MenuItem v-slot="{ active }">
                                  <button
                                    @click="updateStatus(order.id, 'completed')"
                                    :class="[
                                      active ? 'bg-gray-100' : '',
                                      'flex w-full items-center px-4 py-2 text-sm text-gray-700',
                                    ]"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      class="h-4 w-4 mr-2 text-green-500"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    Označit jako zaplacené
                                  </button>
                                </MenuItem>
                                <MenuItem v-slot="{ active }">
                                  <button
                                    @click="updateStatus(order.id, 'cancelled')"
                                    :class="[
                                      active ? 'bg-gray-100' : '',
                                      'flex w-full items-center px-4 py-2 text-sm text-gray-700',
                                    ]"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      class="h-4 w-4 mr-2 text-red-500"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    Zrušit objednávku
                                  </button>
                                </MenuItem>
                              </div>
                            </MenuItems>
                          </transition>
                        </Menu>
                      </td>
                    </tr>
                    <!-- Prázdný stav -->
                    <tr v-if="filteredOrders.length === 0">
                      <td colspan="7" class="px-6 py-10 text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-10 w-10 text-gray-400 mx-auto mb-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p class="text-gray-500 text-base">
                          Žádné objednávky k zobrazení
                        </p>
                        <p class="text-gray-400 text-sm mt-1">
                          Zkuste upravit filtry nebo počkejte na nové objednávky
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script setup lang="ts">
// Definice stránky
definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

// Vue importy
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

// Chart.js importy
import type { ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Bar as BarChart,
  Line as LineChart,
  Doughnut as DoughnutChart,
} from "vue-chartjs";

// Composables
const { orders, getAllOrders, updateOrderStatus } = useTicketOrders();
const { concerts, fetchConcerts } = useConcerts();
const toast = useToast();
const route = useRoute();
const router = useRouter();

// Vybraný tab
const selectedTab = ref(0);

// Sledování změn v URL
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab === "list") {
      selectedTab.value = 1;
    } else {
      selectedTab.value = 0;
    }
  },
  { immediate: true }
);

// Sledování změn v selectedTab a aktualizace URL
watch(selectedTab, (newValue) => {
  if (newValue === 1) {
    router.push({ query: { ...route.query, tab: "list" } });
  } else {
    const query = { ...route.query };
    delete query.tab;
    router.push({ query });
  }
});

// UI komponenty
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";

// Registrace Chart.js komponent
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Definice typů
interface Order {
  id: number;
  concert_id: number;
  customer_name: string;
  customer_email: string;
  ticket_count: number;
  total_price: number;
  payment_status: "pending" | "completed" | "cancelled";
  variable_symbol?: string;
  created_at: string;
  updated_at: string;
}

interface Concert {
  id: number;
  title: string;
}

interface Panel {
  id: string;
  title: string;
  visible: boolean;
  minimized: boolean;
}

interface MonthData {
  label: string;
  date: Date;
}

// Načtení dat
onMounted(async () => {
  await Promise.all([getAllOrders(), fetchConcerts()]);
});

// Vyhledávání a filtry
const searchQuery = ref("");
const statusFilter = ref<"" | "pending" | "completed" | "cancelled">("");
const sortBy = ref("date-desc");

// Pomocné funkce
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("cs-CZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getConcertTitle = (concertId: number): string => {
  const concert = concerts.value?.find((c: Concert) => c.id === concertId);
  return concert?.title || "Neznámý koncert";
};

const getStatusLabel = (
  status: "pending" | "completed" | "cancelled"
): string => {
  switch (status) {
    case "pending":
      return "Čeká na platbu";
    case "completed":
      return "Zaplaceno";
    case "cancelled":
      return "Zrušeno";
    default:
      return status;
  }
};

const updateStatus = async (
  orderId: number,
  status: "pending" | "completed" | "cancelled"
): Promise<void> => {
  try {
    await updateOrderStatus(orderId, status);
    // Aktualizujeme stav přímo v orders.value
    if (orders.value) {
      const orderIndex = orders.value.findIndex((o: Order) => o.id === orderId);
      if (orderIndex !== -1) {
        orders.value[orderIndex].payment_status = status;
      }
    }
    toast.success("Stav objednávky byl úspěšně aktualizován");
  } catch (err) {
    toast.error("Nepodařilo se aktualizovat stav objednávky");
  }
};

// Filtrované objednávky
const filteredOrders = computed(() => {
  let result = orders.value || [];

  // Vyhledávání
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((order: Order) => {
      const concertTitle = getConcertTitle(order.concert_id).toLowerCase();
      return (
        order.customer_name.toLowerCase().includes(query) ||
        order.customer_email.toLowerCase().includes(query) ||
        concertTitle.includes(query)
      );
    });
  }

  // Filtr podle stavu
  if (statusFilter.value) {
    result = result.filter(
      (order: Order) => order.payment_status === statusFilter.value
    );
  }

  // Řazení
  result = [...result].sort((a: Order, b: Order) => {
    switch (sortBy.value) {
      case "date-desc":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "date-asc":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "price-desc":
        return Number(b.total_price) - Number(a.total_price);
      case "price-asc":
        return Number(a.total_price) - Number(b.total_price);
      default:
        return 0;
    }
  });

  return result;
});

// Funkce pro resetování filtrů
const resetFilters = (): void => {
  searchQuery.value = "";
  statusFilter.value = "";
  sortBy.value = "date-desc";
};

// Výpočet statistik
const totalIncome = computed(() => {
  return orders.value
    .filter(
      (order: { payment_status: string }) =>
        order.payment_status === "completed"
    )
    .reduce(
      (sum: number, order: { total_price: number }) =>
        sum + Number(order.total_price),
      0
    );
});

const totalTickets = computed(() => {
  return orders.value
    .filter(
      (order: { payment_status: string }) =>
        order.payment_status === "completed"
    )
    .reduce(
      (sum: number, order: { ticket_count: number }) =>
        sum + order.ticket_count,
      0
    );
});

// Rozšířené statistiky
const completedOrders = computed(
  () =>
    orders.value.filter((order: any) => order.payment_status === "completed")
      .length
);

const averageOrderValue = computed(() =>
  totalIncome.value > 0
    ? Math.round(totalIncome.value / completedOrders.value)
    : 0
);

const averageTicketsPerOrder = computed(() =>
  totalTickets.value > 0
    ? (totalTickets.value / completedOrders.value).toFixed(1)
    : 0
);

// Grafy
const incomeChartData = computed(() => ({
  labels: lastMonths.value.map((m) => m.label),
  datasets: [
    {
      label: "Příjmy z prodeje (Kč)",
      data: monthlyIncomes.value,
      backgroundColor: "rgba(220, 38, 38, 0.5)",
      borderColor: "rgb(220, 38, 38)",
      borderWidth: 1,
    },
  ],
}));

const ticketsChartData = computed(() => ({
  labels: lastMonths.value.map((m) => m.label),
  datasets: [
    {
      label: "Prodané vstupenky (ks)",
      data: monthlyTickets.value,
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.5)",
      tension: 0.3,
    },
  ],
}));

const statusChartData = computed(() => {
  const statuses = {
    pending: orders.value.filter((o: any) => o.payment_status === "pending")
      .length,
    completed: orders.value.filter((o: any) => o.payment_status === "completed")
      .length,
    cancelled: orders.value.filter((o: any) => o.payment_status === "cancelled")
      .length,
  };

  return {
    labels: ["Čeká na platbu", "Zaplaceno", "Zrušeno"],
    datasets: [
      {
        data: [statuses.pending, statuses.completed, statuses.cancelled],
        backgroundColor: [
          "rgba(251, 191, 36, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
      },
    ],
  };
});

const concertsChartData = computed(() => {
  const concertStats = new Map();

  orders.value
    .filter((order: any) => order.payment_status === "completed")
    .forEach((order: any) => {
      const title = getConcertTitle(order.concert_id);
      concertStats.set(
        title,
        (concertStats.get(title) || 0) + order.ticket_count
      );
    });

  const sortedConcerts = Array.from(concertStats.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return {
    labels: sortedConcerts.map(([title]) => title),
    datasets: [
      {
        label: "Prodané vstupenky",
        data: sortedConcerts.map(([, count]) => count),
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 1,
      },
    ],
  };
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right" as const,
    },
  },
};

const horizontalChartOptions = computed(() => ({
  ...chartOptions,
  indexAxis: "y",
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
}));

// Základní nastavení pro grafy
const chartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
};

// Data pro časovou osu grafů
const lastMonths = computed(() => {
  return Array.from({ length: 6 }, (_, i: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      label: date.toLocaleDateString("cs-CZ", {
        month: "long",
        year: "numeric",
      }),
      date: date,
    };
  }).reverse();
});

// Data pro grafy podle měsíců
const monthlyIncomes = computed(() => {
  return lastMonths.value.map(({ date, label }) => {
    return orders.value
      .filter((order: any) => {
        const orderDate = new Date(order.created_at);
        return (
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear() &&
          order.payment_status === "completed"
        );
      })
      .reduce((sum: number, order: any) => sum + Number(order.total_price), 0);
  });
});

const monthlyTickets = computed(() => {
  return lastMonths.value.map(({ date, label }) => {
    return orders.value
      .filter((order: any) => {
        const orderDate = new Date(order.created_at);
        return (
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear() &&
          order.payment_status === "completed"
        );
      })
      .reduce((sum: number, order: any) => sum + order.ticket_count, 0);
  });
});

// Přidám computed properties pro jednotlivé stavy
const pendingOrders = computed(
  () =>
    orders.value?.filter((order: any) => order.payment_status === "pending")
      .length || 0
);

const cancelledOrders = computed(
  () =>
    orders.value?.filter((order: any) => order.payment_status === "cancelled")
      .length || 0
);

// Přidání nového computed property pro hodinové rozložení
const hourlyDistributionData = computed(() => {
  // Vytvoříme pole pro všechny hodiny (0-23)
  const hourCounts = Array(24).fill(0);

  // Počítáme nákupy pro každou hodinu
  orders.value?.forEach((order: any) => {
    const hour = new Date(order.created_at).getHours();
    hourCounts[hour]++;
  });

  return {
    labels: hourCounts.map(
      (_, hour) => `${hour.toString().padStart(2, "0")}:00`
    ),
    datasets: [
      {
        label: "Počet nákupů",
        data: hourCounts,
        backgroundColor: "rgba(147, 51, 234, 0.5)",
        borderColor: "rgb(147, 51, 234)",
        borderWidth: 1,
      },
    ],
  };
});
</script>