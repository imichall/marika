<template>
  <div class="w-full px-4 py-8 pb-20">
    <AdminBreadcrumbs />

    <!-- Nadpis -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Objednávky vstupenek</h1>
    </div>

    <!-- Taby -->
    <TabGroup
      as="div"
      :selected-index="selectedTab"
      @change="(index) => (selectedTab = index)"
      class="w-full"
    >
      <div class="border-b border-gray-200 dark:border-gray-700">
        <TabList class="flex -mb-px space-x-8">
          <Tab v-slot="{ selected }">
            <button
              class="py-4 px-1 border-b-2 font-medium text-sm outline-none whitespace-nowrap"
              :class="[
                selected
                  ? 'border-red-500 dark:border-red-400 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
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
                  ? 'border-red-500 dark:border-red-400 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
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
              <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-800">
                <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-400">
                  Celkový počet objednávek
                </h3>
                <p class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{{ orders?.length || 0 }}</p>
                <div class="mt-2 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <div>Čeká na platbu: {{ pendingOrders }}</div>
                  <div>Zaplaceno: {{ completedOrders }}</div>
                  <div>Zrušeno: {{ cancelledOrders }}</div>
                </div>
              </div>
              <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-800">
                <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-400">
                  Celkový příjem
                </h3>
                <p class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{{ totalIncome }} Kč</p>
                <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Průměrně {{ averageOrderValue }} Kč/objednávka
                </div>
              </div>
              <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-800">
                <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-400">
                  Prodané vstupenky
                </h3>
                <p class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{{ totalTickets }}</p>
                <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Průměrně {{ averageTicketsPerOrder }} ks/objednávka
                </div>
              </div>
            </div>

            <!-- Grafy statistik -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Graf příjmů -->
              <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-800">
                <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Příjmy z prodeje</h2>
                <div class="h-[400px]">
                  <BarChart :data="incomeChartData" :options="chartOptions" />
                </div>
              </div>

              <!-- Graf prodaných vstupenek -->
              <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-800">
                <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Prodané vstupenky</h2>
                <div class="h-[400px]">
                  <LineChart :data="ticketsChartData" :options="chartOptions" />
                </div>
              </div>

              <!-- Graf stavu objednávek -->
              <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-800">
                <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Stav objednávek</h2>
                <div class="h-[400px]">
                  <DoughnutChart
                    :data="statusChartData"
                    :options="doughnutOptions"
                  />
                </div>
              </div>

              <!-- Graf rozložení nákupů -->
              <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-800">
                <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
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
              <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-800">
                <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Nejprodávanější koncerty</h2>
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
              class="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Filtry</h3>
                <button
                  @click="resetFilters"
                  class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
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
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Vyhledat</label
                  >
                  <div class="relative">
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Jméno, email nebo koncert..."
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-gray-400 dark:text-gray-500 absolute right-3 top-2.5"
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
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Status platby</label
                  >
                  <select
                    v-model="statusFilter"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Všechny statusy</option>
                    <option value="pending">Čeká na platbu</option>
                    <option value="completed">Zaplaceno</option>
                    <option value="cancelled">Zrušeno</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Řadit podle</label
                  >
                  <select
                    v-model="sortBy"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="date-desc">Nejnovější</option>
                    <option value="date-asc">Nejstarší</option>
                    <option value="price-desc">Nejvyšší cena</option>
                    <option value="price-asc">Nejnižší cena</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Přidat tlačítko tisku vedle existujících filtrů -->
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center space-x-4">
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filtr podle koncertu/VS
                  </label>
                  <div class="flex items-center space-x-2">
                    <input
                      v-model="concertFilter"
                      type="text"
                      placeholder="Název koncertu nebo VS..."
                      class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <button
                      @click="clearConcertFilter"
                      class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                      title="Vymazat filtr"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <button
                @click="openPrintModal"
                class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Tisk
              </button>
            </div>

            <!-- Seznam objednávek -->
            <div
              class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[60vh]"
            >
              <div class="overflow-x-auto h-full relative">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Datum
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Zákazník
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Koncert
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Vstupenky
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Celkem
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Akce
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr
                      v-for="order in filteredOrders"
                      :key="order.id"
                      @click="openOrderDetail(order)"
                      class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400"
                      >
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ formatDate(order.created_at) }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                          {{ formatTime(order.created_at) }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ order.customer_name }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                          {{ order.customer_email }}
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-900 dark:text-white">
                          {{ getConcertTitle(order.concert_id) }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                          VS: {{ order.variable_symbol }}
                        </div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400"
                      >
                        {{ order.ticket_count }} ks
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ order.total_price }} Kč
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span
                          :class="{
                            'px-2 py-1 text-xs font-medium rounded-md': true,
                            'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700':
                              order.payment_status === 'pending',
                            'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700':
                              order.payment_status === 'completed',
                            'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700':
                              order.payment_status === 'cancelled',
                          }"
                        >
                          {{ getStatusLabel(order.payment_status) }}
                        </span>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-right text-sm"
                      >
                        <Menu
                          as="div"
                          @click.stop
                          class="relative inline-block text-left"
                        >
                          <MenuButton
                            class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-5 w-5 text-gray-400 dark:text-gray-500"
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
                              class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 dark:ring-opacity-20 focus:outline-none z-50 border border-gray-200 dark:border-gray-800"
                            >
                              <div class="py-1">
                                <MenuItem v-slot="{ active }">
                                  <button
                                    @click.stop="openOrderDetail(order)"
                                    :class="[
                                      active ? 'bg-gray-100 dark:bg-gray-800' : '',
                                      'flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300',
                                    ]"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      class="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                    Zobrazit detail
                                  </button>
                                </MenuItem>
                                <MenuItem
                                  v-if="
                                    permissions.edit &&
                                    order.payment_status === 'pending'
                                  "
                                  v-slot="{ active }"
                                >
                                  <button
                                    @click.stop="editOrder(order)"
                                    :class="[
                                      active ? 'bg-gray-100 dark:bg-gray-800' : '',
                                      'flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300',
                                    ]"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      class="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                    Upravit objednávku
                                  </button>
                                </MenuItem>
                                <MenuItem
                                  v-if="
                                    permissions.complete &&
                                    order.payment_status === 'pending'
                                  "
                                  v-slot="{ active }"
                                >
                                  <button
                                    @click.stop="
                                      updateStatus(order.id, 'completed')
                                    "
                                    :class="[
                                      active ? 'bg-gray-100 dark:bg-gray-800' : '',
                                      'flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300',
                                    ]"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      class="h-4 w-4 mr-2 text-green-500 dark:text-green-400"
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
                                <MenuItem
                                  v-if="
                                    permissions.cancel &&
                                    order.payment_status === 'pending'
                                  "
                                  v-slot="{ active }"
                                >
                                  <button
                                    @click.stop="
                                      updateStatus(order.id, 'cancelled')
                                    "
                                    :class="[
                                      active ? 'bg-gray-100 dark:bg-gray-800' : '',
                                      'flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300',
                                    ]"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      class="h-4 w-4 mr-2 text-red-500 dark:text-red-400"
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
                                <MenuItem
                                  v-if="permissions.delete"
                                  v-slot="{ active }"
                                >
                                  <button
                                    @click.stop="confirmDeleteOrder(order)"
                                    :class="[
                                      active ? 'bg-gray-100 dark:bg-gray-800' : '',
                                      'flex w-full items-center px-4 py-2 text-sm text-red-700 dark:text-red-400',
                                    ]"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      class="h-4 w-4 mr-2 text-red-500 dark:text-red-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                    Smazat objednávku
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
                          class="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-3"
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
                        <p class="text-gray-500 dark:text-gray-400 text-base">
                          Žádné objednávky k zobrazení
                        </p>
                        <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">
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

    <!-- Modální okno -->
    <OrderDetailModal
      v-if="selectedOrder"
      :is-open="isDetailModalOpen"
      :order="selectedOrder"
      :bank-account="bankAccount"
      :get-concert-title="getConcertTitle"
      :can-edit="permissions.edit"
      :permissions="{
        complete: permissions.complete,
        cancel: permissions.cancel,
      }"
      @close="closeOrderDetail"
      @update-status="handleStatusUpdate"
    />

    <!-- Delete Confirmation Modal -->
    <TransitionRoot appear :show="isDeleteModalOpen" as="template">
      <Dialog as="div" @close="closeDeleteModal" class="relative z-50">
        <TransitionChild
          as="div"
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
              as="div"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-800"
              >
                <DialogTitle
                  as="h3"
                  class="text-2xl font-bold mb-4 text-gray-900 dark:text-white"
                >
                  Smazat objednávku
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-gray-600 dark:text-gray-400">
                    Opravdu chcete smazat tuto objednávku? Tato akce je
                    nevratná.
                  </p>
                  <div class="mt-4 bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <p class="text-yellow-800 dark:text-yellow-300 font-medium">
                      Detaily objednávky:
                    </p>
                    <ul class="mt-2 space-y-1 text-yellow-700 dark:text-yellow-300">
                      <li>Zákazník: {{ orderToDelete?.customer_name }}</li>
                      <li>Email: {{ orderToDelete?.customer_email }}</li>
                      <li>
                        Koncert:
                        {{ getConcertTitle(orderToDelete?.concert_id) }}
                      </li>
                      <li>Celkem: {{ orderToDelete?.total_price }} Kč</li>
                    </ul>
                  </div>
                </div>

                <div class="mt-6 flex justify-end gap-4">
                  <button
                    @click="closeDeleteModal"
                    class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Zrušit
                  </button>
                  <button
                    @click="deleteOrder"
                    class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Smazat objednávku
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal pro nastavení tisku -->
    <TransitionRoot appear :show="isPrintModalOpen" as="template">
      <Dialog as="div" @close="closePrintModal" class="relative z-50">
        <div class="fixed inset-0 bg-black bg-opacity-25" />
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-800"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 dark:text-white"
              >
                Nastavení tisku
              </DialogTitle>

              <div class="mt-4">
                <div class="space-y-4">
                  <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >Vyberte status objednávek</label
                    >
                    <div class="mt-2 space-y-2">
                      <label class="inline-flex items-center">
                        <input
                          type="checkbox"
                          v-model="printSettings.pending"
                          class="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span class="ml-2 text-gray-700 dark:text-gray-300">Čekající</span>
                      </label>
                      <br />
                      <label class="inline-flex items-center">
                        <input
                          type="checkbox"
                          v-model="printSettings.completed"
                          class="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span class="ml-2 text-gray-700 dark:text-gray-300">Zaplacené</span>
                      </label>
                      <br />
                      <label class="inline-flex items-center">
                        <input
                          type="checkbox"
                          v-model="printSettings.cancelled"
                          class="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span class="ml-2 text-gray-700 dark:text-gray-300">Zrušené</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  @click="closePrintModal"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  @click="printOrders"
                >
                  Tisknout
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
// Definice stránky
definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

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
  date: string;
  image?: string;
  image_position?: string;
  is_voluntary?: boolean;
  ticket_id?: string;
  variable_symbol?: string;
}

interface MonthData {
  label: string;
  date: Date;
}

// Vue importy
import {
  ref,
  onMounted,
  computed,
  watch,
  useRoute,
  useRouter,
  useSupabaseClient,
} from "#imports";

// Chart.js importy
import type { ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
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

// UI komponenty
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@headlessui/vue";

// Composables
import { useTicketOrders } from "~/composables/useTicketOrders";
import { useConcerts } from "~/composables/useConcerts";
import { useToast } from "~/composables/useToast";

// Inicializace composables
const { orders, getAllOrders, updateOrderStatus } = useTicketOrders();
const { concerts, fetchConcerts } = useConcerts();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();

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

// Inicializace oprávnění
const permissions = ref({
  edit: false,
  complete: false,
  cancel: false,
  delete: false,
});

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const userData = await supabase.auth.getUser();
    if (!userData.data.user?.email) {
      console.error("User email not found");
      return;
    }

    // Nejprve získáme roli uživatele
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("email", userData.data.user.email)
      .single();

    if (roleError) {
      console.error("Error loading user role:", roleError);
      return;
    }

    // Pak získáme oprávnění pro tuto roli
    const { data: perms, error: permError } = await supabase.rpc(
      "get_role_permissions",
      {
        p_role: userRole.role,
      }
    );

    if (permError) {
      console.error("Error loading permissions:", permError);
      return;
    }

    if (perms) {
      permissions.value = {
        edit: perms.some((p) => p.section === "orders" && p.action === "edit"),
        complete: perms.some(
          (p) => p.section === "orders" && p.action === "complete"
        ),
        cancel: perms.some(
          (p) => p.section === "orders" && p.action === "cancel"
        ),
        delete: perms.some(
          (p) => p.section === "orders" && p.action === "delete"
        ),
      };
    }
  } catch (err) {
    console.error("Error in loadPermissions:", err);
  }
};

// Načteme oprávnění při mounted
onMounted(async () => {
  await Promise.all([
    loadPermissions(),
    getAllOrders(),
    fetchConcerts(),
    loadBankAccount(),
  ]);
  // Po načtení dat zkontrolujeme, jestli máme otevřít detail
  const orderId = route.query.order;
  if (orderId) {
    const order = orders.value?.find((o) => o.id === Number(orderId));
    if (order) {
      openOrderDetail(order);
    }
  }
});

// Sledování změn v URL pro otevření detailu objednávky
watch(
  () => route.query.order,
  async (orderId) => {
    if (orderId && orders.value?.length === 0) {
      // Pokud nemáme data, načteme je
      await getAllOrders();
    }
    if (orderId) {
      const order = orders.value?.find((o) => o.id === Number(orderId));
      if (order) {
        openOrderDetail(order);
      }
    }
  }
);

// Vyhledávání a filtry
const searchQuery = ref("");
const statusFilter = ref<"" | "pending" | "completed" | "cancelled">("");
const sortBy = ref("date-desc");
const concertFilter = ref("");

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

  // Filtr podle koncertu nebo variabilního symbolu
  if (concertFilter.value) {
    const filterQuery = concertFilter.value.toLowerCase();
    result = result.filter((order: Order) => {
      const concertTitle = getConcertTitle(order.concert_id).toLowerCase();
      const variableSymbol = (order.variable_symbol || "").toLowerCase();

      return (
        concertTitle.includes(filterQuery) ||
        variableSymbol.includes(filterQuery)
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
  concertFilter.value = "";
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

// Stav modálního okna
const selectedOrder = ref(null);
const isDetailModalOpen = ref(false);

// Funkce pro otevření detailu objednávky
const openOrderDetail = (order) => {
  selectedOrder.value = order;
  isDetailModalOpen.value = true;
};

// Funkce pro zavření detailu objednávky
const closeOrderDetail = () => {
  selectedOrder.value = null;
  isDetailModalOpen.value = false;
};

// Funkce pro aktualizaci stavu objednávky
const handleStatusUpdate = async (
  orderId: number,
  newStatus: "pending" | "completed" | "cancelled"
) => {
  try {
    await updateOrderStatus(orderId, newStatus);
    await getAllOrders();
    toast.success("Stav objednávky byl úspěšně aktualizován");
    closeOrderDetail();
  } catch (error) {
    console.error("Chyba při aktualizaci stavu:", error);
    toast.error("Nepodařilo se aktualizovat stav objednávky");
  }
};

// Funkce pro úpravu objednávky
const editOrder = (order: Order) => {
  // Prozatím otevřeme detail objednávky - později lze rozšířit o editaci
  openOrderDetail(order);
};

// Přidáme nové proměnné pro mazání
const isDeleteModalOpen = ref(false);
const orderToDelete = ref<Order | null>(null);

// Přidáme nové funkce pro mazání
const confirmDeleteOrder = (order: Order) => {
  orderToDelete.value = order;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  orderToDelete.value = null;
  isDeleteModalOpen.value = false;
};

const deleteOrder = async () => {
  if (!orderToDelete.value) return;

  try {
    const { error } = await supabase
      .from("ticket_orders")
      .delete()
      .eq("id", orderToDelete.value.id);

    if (error) throw error;

    // Aktualizujeme seznam objednávek
    await getAllOrders();
    toast.success("Objednávka byla úspěšně smazána");
    closeDeleteModal();
  } catch (err) {
    console.error("Error deleting order:", err);
    toast.error("Nepodařilo se smazat objednávku");
  }
};

// Bankovní účet
const bankAccount = ref({
  account_number: "",
  bank_code: "",
  iban: "",
  swift: "",
});

// Načtení bankovního účtu
const loadBankAccount = async () => {
  try {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("name", "marikaSingers")
      .single();

    if (data?.value) {
      const settings = JSON.parse(data.value);
      bankAccount.value = {
        account_number: settings.accountNumber || "",
        bank_code: settings.bankCode || "",
        iban: settings.iban || "",
        swift: settings.swift || "",
      };
    }
  } catch (err) {
    console.error("Error loading bank account:", err);
    toast.error("Nepodařilo se načíst bankovní údaje");
  }
};

// Nové proměnné pro tisk
const isPrintModalOpen = ref(false);
const printSettings = ref({
  pending: true,
  completed: false,
  cancelled: false,
});

const openPrintModal = () => {
  isPrintModalOpen.value = true;
};

const closePrintModal = () => {
  isPrintModalOpen.value = false;
};

const clearConcertFilter = () => {
  concertFilter.value = "";
};

const printOrders = () => {
  // Použijeme už filtrované objednávky (které zahrnují filtr podle koncertu)
  let ordersToPrint = filteredOrders.value;
  console.log("Celkem objednávek po hlavních filtrech:", ordersToPrint.length);

  // Filtrovat objednávky podle vybraných statusů pro tisk
  console.log("Nastavení statusů pro tisk:", printSettings.value);
  ordersToPrint = ordersToPrint.filter((order) => {
    const matches = (
      (printSettings.value.pending && order.payment_status === "pending") ||
      (printSettings.value.completed && order.payment_status === "completed") ||
      (printSettings.value.cancelled && order.payment_status === "cancelled")
    );
    return matches;
  });
  console.log("Objednávky po filtru statusu pro tisk:", ordersToPrint.length);

  // Vytvořit dočasný element pro tisk
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Nepodařilo se otevřít okno pro tisk");
    return;
  }

  // Vytvořit informace o filtrech
  const filterInfo = [];
  const statusFilters = [];
  if (printSettings.value.pending) statusFilters.push("Čekající");
  if (printSettings.value.completed) statusFilters.push("Zaplacené");
  if (printSettings.value.cancelled) statusFilters.push("Zrušené");

  if (statusFilters.length > 0) {
    filterInfo.push(`Status: ${statusFilters.join(", ")}`);
  }

  if (concertFilter.value) {
    filterInfo.push(`Koncert/VS: "${concertFilter.value}"`);
  }

  const filterInfoHtml = filterInfo.length > 0 ?
    `<div style="margin-bottom: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 4px;">
      <strong>Použité filtry:</strong> ${filterInfo.join(" | ")}<br>
      <strong>Celkem objednávek v databázi:</strong> ${orders.value?.length || 0}<br>
      <strong>Objednávky k tisku:</strong> ${ordersToPrint.length}
    </div>` :
    `<div style="margin-bottom: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 4px;">
      <strong>Celkem objednávek v databázi:</strong> ${orders.value?.length || 0}<br>
      <strong>Objednávky k tisku:</strong> ${ordersToPrint.length}
    </div>`;

  printWindow.document.write(`
    <html>
      <head>
        <title>Tisk objednávek</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          @media print {
            @page { size: A4; margin: 2cm; }
          }
        </style>
      </head>
      <body>
        <h1>Seznam objednávek</h1>
        ${filterInfoHtml}
        <p style="color: #666; margin-bottom: 20px;">
          Vytištěno: ${new Date().toLocaleString('cs-CZ')}
        </p>
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Zákazník</th>
              <th>Koncert</th>
              <th>Vstupenky</th>
              <th>Celkem</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${ordersToPrint
              .map(
                (order) => `
              <tr>
                <td>${formatDate(order.created_at)}<br>${formatTime(
                  order.created_at
                )}</td>
                <td>${order.customer_name}<br>${order.customer_email}</td>
                <td>${getConcertTitle(order.concert_id)}<br>VS: ${
                  order.variable_symbol
                }</td>
                <td>${order.ticket_count} ks</td>
                <td>${order.total_price} Kč</td>
                <td>${getStatusLabel(order.payment_status)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
  closePrintModal();
};
</script>
