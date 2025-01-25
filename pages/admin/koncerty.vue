<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1
        class="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"
      >
        Správa koncertů
      </h1>
      <div class="flex gap-4">
        <button
          @click="showAddModal = true"
          class="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 inline-flex items-center gap-2"
          :disabled="loading"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Přidat koncert
        </button>
        <button
          @click="showTicketModal = true"
          class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 inline-flex items-center gap-2"
          :disabled="loading"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
            />
          </svg>
          Správa vstupenek
        </button>
      </div>
    </div>

    <!-- Filtry a vyhledávání -->
    <div class="mb-8 space-y-4">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Vyhledávání -->
        <div class="flex-1">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Vyhledat koncert..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
          />
        </div>

        <!-- Filtr podle tělesa -->
        <div class="md:w-48">
          <select
            v-model="selectedGroup"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
          >
            <option value="">Všechna tělesa</option>
            <option value="Marika Singers">Marika Singers</option>
            <option value="Five">Five</option>
            <option value="Voices">Voices</option>
          </select>
        </div>

        <!-- Filtr podle vstupenek -->
        <div class="md:w-48">
          <select
            v-model="ticketFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
          >
            <option value="">Všechny koncerty</option>
            <option value="withTickets">S online vstupenkami</option>
            <option value="withoutTickets">Bez online vstupenek</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm mb-6"
    >
      <p class="flex items-center gap-2">
        <span class="material-icons-outlined">error_outline</span>
        {{ error }}
      </p>
    </div>

    <!-- Tabulka koncertů -->
    <div
      v-else
      class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                <div class="flex items-center justify-center">Název</div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                <div class="flex items-center justify-center">Datum</div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                <div class="flex items-center justify-center">Čas</div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                <div class="flex items-center justify-center">Těleso</div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                <div class="flex items-center justify-center">Vstupné</div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                <div class="flex items-center justify-center">Akce</div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="concert in paginatedConcerts"
              :key="concert.id"
              class="hover:bg-gray-50 transition-colors duration-200"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ concert.title }}
                      <span
                        v-if="concert.ticket_id"
                        class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-3 h-3 mr-1"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
                          />
                        </svg>
                        Vstupenky
                      </span>
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ formatDate(concert.date) }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{
                    new Date(concert.date).toLocaleDateString("cs-CZ", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ concert.time }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-3 py-1 text-sm font-medium bg-red-50 text-red-600 rounded-full"
                >
                  {{ concert.group_name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-3 py-1 text-sm font-medium bg-green-50 text-green-600 rounded-full"
                >
                  {{ concert.price }} Kč
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1"
              >
                <button
                  @click="editConcert(concert)"
                  class="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-150"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </button>
                <button
                  @click="handleDelete(concert.id)"
                  class="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-150"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="concerts.length === 0">
              <td colspan="5" class="px-6 py-12 text-center">
                <div
                  class="flex flex-col items-center justify-center text-gray-500"
                >
                  <span class="material-icons-outlined text-4xl mb-2"
                    >event_busy</span
                  >
                  <p class="text-lg">Zatím nejsou přidány žádné koncerty</p>
                  <button
                    @click="showAddModal = true"
                    class="mt-4 text-red-600 hover:text-red-700 font-medium transition-colors duration-150"
                  >
                    Přidat první koncert
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Zobrazeno {{ paginationStart + 1 }} - {{ paginationEnd }} z
            {{ filteredConcerts.length }} koncertů
          </div>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
            >
              Předchozí
            </button>
            <div class="flex items-center gap-1">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-4 py-2 text-sm rounded-lg border transition-colors duration-200',
                  currentPage === page
                    ? 'bg-red-800 text-white border-red-800'
                    : 'border-gray-300 hover:bg-gray-50',
                ]"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
            >
              Další
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Po existující tabulce koncertů přidáme tabulku vstupenek -->
    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">Odkazy na vstupenky</h2>
      <div
        class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                  <div class="flex items-center justify-center">
                    Název koncertu
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                  <div class="flex items-center justify-center">Těleso</div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                  <div class="flex items-center justify-center">
                    Poskytovatel
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                  <div class="flex items-center justify-center">Odkaz</div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500">
                  <div class="flex items-center justify-center">Akce</div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr
                v-for="ticket in paginatedTickets"
                :key="ticket.id"
                class="hover:bg-gray-50/50 transition-colors duration-150"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ ticket.title }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-3 py-1 text-sm font-medium bg-red-50 text-red-600 rounded-full"
                  >
                    {{ getGroupName(ticket.group_id) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-600 rounded-full"
                  >
                    {{ ticket.provider }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <a
                    :href="ticket.ticket_url"
                    target="_blank"
                    class="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Odkaz na vstupenky
                  </a>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="editTicket(ticket)"
                      class="inline-flex items-center justify-center w-8 h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-150"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                    <button
                      @click="handleDeleteTicket(ticket.id)"
                      class="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-150"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="concertTickets.length === 0">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div
                    class="flex flex-col items-center justify-center text-gray-500"
                  >
                    <div class="relative w-24 h-24 mb-4">
                      <!-- Animované noty -->
                      <span
                        class="absolute animate-float-slow text-3xl"
                        style="left: 0; animation-delay: 0s"
                        >♪</span
                      >
                      <span
                        class="absolute animate-float-slow text-4xl"
                        style="left: 40%; top: 20%; animation-delay: 0.5s"
                        >♫</span
                      >
                      <span
                        class="absolute animate-float-slow text-3xl"
                        style="right: 0; top: 10%; animation-delay: 1s"
                        >♪</span
                      >
                      <span
                        class="absolute animate-float-slow text-4xl"
                        style="left: 20%; bottom: 0; animation-delay: 1.5s"
                        >♫</span
                      >
                    </div>
                    <p class="text-lg">
                      Zatím nejsou přidány žádné odkazy na vstupenky
                    </p>
                    <button
                      @click="showTicketModal = true"
                      class="mt-4 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150"
                    >
                      Přidat první odkaz
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination pro vstupenky -->
        <div
          class="bg-gray-50 px-6 py-4 mt-4 rounded-lg border border-gray-200"
        >
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Zobrazeno {{ ticketPaginationStart + 1 }} -
              {{ ticketPaginationEnd }} z {{ concertTickets.length }} vstupenek
            </div>
            <div class="flex gap-2">
              <button
                @click="ticketCurrentPage--"
                :disabled="ticketCurrentPage === 1"
                class="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
              >
                Předchozí
              </button>
              <div class="flex items-center gap-1">
                <button
                  v-for="page in ticketTotalPages"
                  :key="page"
                  @click="ticketCurrentPage = page"
                  :class="[
                    'px-4 py-2 text-sm rounded-lg border transition-colors duration-200',
                    ticketCurrentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50',
                  ]"
                >
                  {{ page }}
                </button>
              </div>
              <button
                @click="ticketCurrentPage++"
                :disabled="ticketCurrentPage === ticketTotalPages"
                class="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
              >
                Další
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pro přidání/editaci koncertu -->
    <TransitionRoot appear :show="showAddModal" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-50">
        <!-- Backdrop -->
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
            <!-- Modal panel -->
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="bg-white p-6 rounded-lg w-full max-w-2xl">
                <DialogTitle as="h2" class="text-xl font-bold mb-4">
                  {{ editingConcert ? "Upravit" : "Přidat" }} koncert
                </DialogTitle>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">
                        Název koncertu
                      </label>
                      <input
                        v-model="form.title"
                        type="text"
                        required
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">
                        Těleso
                      </label>
                      <select
                        v-model="form.group_name"
                        required
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Vyberte těleso</option>
                        <option value="Marika Singers">Marika Singers</option>
                        <option value="Five">Five</option>
                        <option value="Voices">Voices</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">
                        Datum
                      </label>
                      <input
                        v-model="form.date"
                        type="date"
                        required
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">
                        Čas
                      </label>
                      <input
                        v-model="form.time"
                        type="time"
                        required
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">
                        Cena vstupného
                      </label>
                      <input
                        v-model="form.price"
                        type="number"
                        required
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">
                        Přiřadit vstupenku
                      </label>
                      <select
                        v-model="form.ticket_id"
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option :value="''">
                          Bez vstupenky (použít QR platbu)
                        </option>
                        <option
                          v-for="ticket in concertTickets"
                          :key="ticket.id"
                          :value="ticket.id.toString()"
                        >
                          {{ ticket.title }} ({{ ticket.provider }})
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Informace o koncertu
                    </label>
                    <textarea
                      v-model="form.description"
                      required
                      rows="4"
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    ></textarea>
                  </div>

                  <!-- Podmíněné zobrazení QR generátoru -->
                  <div v-if="showQRSection">
                    <QRCodeGenerator
                      :concert-title="form.title"
                      :price="Number(form.price)"
                      :selected-group="form.group_name"
                      v-model="form.variable_symbol"
                      v-model:account-number="form.account_number"
                      v-model:bank-code="form.bank_code"
                    />
                  </div>

                  <!-- Nahrávání obrázku -->
                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Obrázek koncertu
                    </label>
                    <div
                      class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-500 transition-colors duration-200"
                      :class="{ 'border-red-500': isDragging }"
                      @dragenter.prevent="isDragging = true"
                      @dragleave.prevent="isDragging = false"
                      @dragover.prevent
                      @drop.prevent="handleDrop"
                    >
                      <div v-if="!form.image && !imagePreview" class="py-4">
                        <span
                          class="material-icons-outlined text-4xl text-gray-400 mb-2"
                        >
                          Nahrát obrázek
                        </span>
                        <p class="text-gray-500">
                          Přetáhněte sem obrázek nebo
                          <label
                            class="text-red-500 hover:text-red-600 cursor-pointer"
                          >
                            vyberte ze zařízení
                            <input
                              type="file"
                              class="hidden"
                              accept="image/*"
                              @change="handleFileSelect"
                            />
                          </label>
                        </p>
                        <p class="text-sm text-gray-400 mt-1">
                          Podporované formáty: JPG, PNG, WebP
                        </p>
                      </div>

                      <div v-else class="relative">
                        <img
                          :src="
                            imagePreview ||
                            (form.image ? getFullImageUrl(form.image) : '')
                          "
                          alt="Náhled obrázku"
                          class="max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          @click.prevent.stop="removeImage"
                          type="button"
                          class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200"
                          title="Odstranit obrázek"
                        >
                          <span class="material-icons-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      @click="closeModal"
                      class="inline-flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-200"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
                    >
                      {{ editingConcert ? "Uložit" : "Přidat" }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Potvrzovací dialog pro smazání -->
    <TransitionRoot appear :show="showDeleteModal" as="template">
      <Dialog as="div" @close="showDeleteModal = false" class="relative z-50">
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
              <DialogPanel class="bg-white p-6 rounded-lg w-full max-w-md">
                <DialogTitle as="h2" class="text-xl font-bold mb-4">
                  Smazat koncert
                </DialogTitle>
                <p class="text-gray-600 mb-6">
                  Opravdu chcete smazat tento koncert?
                </p>
                <div class="flex justify-end space-x-4">
                  <button
                    @click="showDeleteModal = false"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
                  >
                    Zrušit
                  </button>
                  <button
                    @click="confirmDelete"
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                  >
                    Smazat
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal pro správu vstupenek -->
    <TransitionRoot appear :show="showTicketModal" as="template">
      <Dialog as="div" @close="closeTicketModal" class="relative z-50">
        <!-- Backdrop -->
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
            <DialogPanel
              class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle as="h2" class="text-xl font-bold mb-4">
                {{ editingTicket ? "Upravit" : "Přidat" }} odkaz na vstupenky
              </DialogTitle>

              <form @submit.prevent="handleTicketSubmit" class="space-y-4">
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Název koncertu
                  </label>
                  <input
                    v-model="ticketForm.title"
                    type="text"
                    required
                    placeholder="Např. Vánoční koncert 2024"
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Těleso
                  </label>
                  <select
                    v-model="ticketForm.group_id"
                    required
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Vyberte těleso</option>
                    <option value="9001cdb8-80fd-4923-8aa9-8dedc9a30c77">
                      Marika Singers
                    </option>
                    <option value="af581892-2252-462f-88f2-e73218b4e785">
                      Five
                    </option>
                    <option value="ba4f5374-5d60-4354-a2ce-e83e130bba83">
                      Voices
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Poskytovatel vstupenek
                  </label>
                  <select
                    v-model="ticketForm.provider"
                    required
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Vyberte poskytovatele</option>
                    <option value="GoOut">GoOut</option>
                    <option value="Ticketmaster">Ticketmaster</option>
                    <option value="Ticketportal">Ticketportal</option>
                    <option value="Jiné">Jiné</option>
                  </select>
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Odkaz na vstupenky
                  </label>
                  <input
                    v-model="ticketForm.ticket_url"
                    type="url"
                    required
                    placeholder="https://"
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div class="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    @click="closeTicketModal"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                  >
                    Uložit
                  </button>
                </div>
              </form>

              <!-- Seznam vstupenek -->
              <div class="mt-6">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th
                          class="px-6 py-4 text-left text-xs font-bold text-gray-500"
                        >
                          <div class="flex items-center justify-center">
                            Název koncertu
                          </div>
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-bold text-gray-500"
                        >
                          <div class="flex items-center justify-center">
                            Těleso
                          </div>
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-bold text-gray-500"
                        >
                          <div class="flex items-center justify-center">
                            Poskytovatel
                          </div>
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-bold text-gray-500"
                        >
                          <div class="flex items-center justify-center">
                            Odkaz
                          </div>
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-bold text-gray-500"
                        >
                          <div class="flex items-center justify-center">
                            Akce
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr
                        v-for="ticket in paginatedTickets"
                        :key="ticket.id"
                        class="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-gray-900">
                            {{ ticket.title }}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            class="px-3 py-1 text-sm font-medium bg-red-50 text-red-600 rounded-full"
                          >
                            {{ getGroupName(ticket.group_id) }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            class="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-600 rounded-full"
                          >
                            {{ ticket.provider }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <a
                            :href="ticket.ticket_url"
                            target="_blank"
                            class="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            Odkaz na vstupenky
                          </a>
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        >
                          <div class="flex justify-end space-x-2">
                            <button
                              @click="editTicket(ticket)"
                              class="inline-flex items-center justify-center w-8 h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-150"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-4 h-4"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                />
                              </svg>
                            </button>
                            <button
                              @click="handleDeleteTicket(ticket.id)"
                              class="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-150"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-4 h-4"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Pagination pro vstupenky -->
              <div
                class="bg-gray-50 px-6 py-4 mt-4 rounded-lg border border-gray-200"
              >
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500">
                    Zobrazeno {{ ticketPaginationStart + 1 }} -
                    {{ ticketPaginationEnd }} z
                    {{ concertTickets.length }} vstupenek
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="ticketCurrentPage--"
                      :disabled="ticketCurrentPage === 1"
                      class="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      Předchozí
                    </button>
                    <div class="flex items-center gap-1">
                      <button
                        v-for="page in ticketTotalPages"
                        :key="page"
                        @click="ticketCurrentPage = page"
                        :class="[
                          'px-4 py-2 text-sm rounded-lg border transition-colors duration-200',
                          ticketCurrentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50',
                        ]"
                      >
                        {{ page }}
                      </button>
                    </div>
                    <button
                      @click="ticketCurrentPage++"
                      :disabled="ticketCurrentPage === ticketTotalPages"
                      class="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      Další
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Potvrzovací dialog pro smazání vstupenky -->
    <TransitionRoot appear :show="showDeleteTicketModal" as="template">
      <Dialog
        as="div"
        @close="showDeleteTicketModal = false"
        class="relative z-50"
      >
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
              <DialogPanel class="bg-white p-6 rounded-lg w-full max-w-md">
                <DialogTitle as="h2" class="text-xl font-bold mb-4">
                  Smazat odkaz na vstupenky
                </DialogTitle>
                <p class="text-gray-600 mb-6">
                  Opravdu chcete smazat tento odkaz na vstupenky?
                </p>
                <div class="flex justify-end space-x-4">
                  <button
                    @click="showDeleteTicketModal = false"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
                  >
                    Zrušit
                  </button>
                  <button
                    @click="confirmDeleteTicket"
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                  >
                    Smazat
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

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useConcerts } from "~/composables/useConcerts";
import { useCategories } from "~/composables/useCategories";
import { useToast } from "~/composables/useToast";
import { useSupabaseClient } from "#imports";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import ConcertQRCode from "~/components/ConcertQRCode.vue";
import { format, parse } from "date-fns";
import { cs } from "date-fns/locale";

const {
  concerts,
  loading,
  error,
  fetchConcerts,
  addConcert,
  updateConcert,
  deleteConcert,
} = useConcerts();

const toast = useToast();

const supabase = useSupabaseClient();

const showAddModal = ref(false);
const editingConcert = ref(null);
const qrGenerator = ref(null);
const showDeleteModal = ref(false);
const concertToDelete = ref(null);

const isDragging = ref(false);
const imagePreview = ref(null);

const form = ref({
  title: "",
  date: "",
  time: "",
  description: "",
  group_name: "",
  price: 0,
  image: "",
  variable_symbol: "",
  qr_session: "",
  account_number: "123456789",
  bank_code: "0100",
  ticket_id: null,
});

const showTicketModal = ref(false);
const concertTickets = ref([]);
const ticketForm = ref({
  title: "",
  group_id: "",
  provider: "",
  ticket_url: "",
});

// Přidáme nové refs pro filtry
const searchQuery = ref("");
const selectedGroup = ref("");
const ticketFilter = ref("");

// Přidáme konstantu pro počet položek na stránku
const ITEMS_PER_PAGE = 10;

// Přidáme ref pro aktuální stránku
const currentPage = ref(1);

// Computed properties pro stránkování
const totalPages = computed(() =>
  Math.ceil(filteredConcerts.value.length / ITEMS_PER_PAGE)
);

const paginationStart = computed(
  () => (currentPage.value - 1) * ITEMS_PER_PAGE
);

const paginationEnd = computed(() =>
  Math.min(
    paginationStart.value + ITEMS_PER_PAGE,
    filteredConcerts.value.length
  )
);

const paginatedConcerts = computed(() => {
  return filteredConcerts.value.slice(
    paginationStart.value,
    paginationEnd.value
  );
});

// Resetujeme stránku při změně filtrů
watch([searchQuery, selectedGroup, ticketFilter], () => {
  currentPage.value = 1;
});

// Funkce pro odstranění diakritiky
const removeDiacritics = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Watch pro okamžitou aktualizaci variable_symbol
watch(
  () => form.value.title,
  (newTitle) => {
    if (!form.value.ticket_id) {
      const words = removeDiacritics(newTitle).split(" ");
      const currentYear = new Date().getFullYear().toString();
      const initials = words
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase();
      form.value.variable_symbol = (initials + currentYear).slice(0, 10);
    }
  },
  { immediate: true }
);

// Přidáme watch pro ticket_id, aby se vyčistily QR údaje při výběru vstupenky
watch(
  () => form.value.ticket_id,
  (newTicketId) => {
    if (newTicketId) {
      form.value.variable_symbol = "";
      form.value.account_number = "";
      form.value.bank_code = "";
      form.value.qr_session = "";
    } else {
      // Obnovíme výchozí hodnoty
      form.value.account_number = "123456789";
      form.value.bank_code = "0100";
      // Znovu vygenerujeme variable_symbol
      const words = removeDiacritics(form.value.title).split(" ");
      const currentYear = new Date().getFullYear().toString();
      const initials = words
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase();
      form.value.variable_symbol = (initials + currentYear).slice(0, 10);
    }
  }
);

const sortedConcerts = computed(() => {
  if (!concerts.value) return [];
  return [...concerts.value].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("cs-CZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getFullImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (process.client && path.startsWith("/")) {
    return window.location.origin + path;
  }
  return path;
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    processFile(file);
  }
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    processFile(file);
  }
};

const processFile = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    alert("Obrázek je příliš velký. Maximální velikost je 5MB.");
    return;
  }

  try {
    const formData = new FormData();
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")}`;
    formData.append("image", file, fileName);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Nahrávání selhalo");
    }

    const data = await response.json();
    if (data.success) {
      form.value.image = data.path;
      imagePreview.value = getFullImageUrl(data.path);
    }
  } catch (err) {
    alert("Chyba při nahrávání obrázku: " + err.message);
  }
};

const removeImage = (e) => {
  e?.preventDefault();
  e?.stopPropagation();
  form.value.image = "";
  imagePreview.value = null;
};

const resetForm = () => {
  form.value = {
    title: "",
    date: "",
    time: "",
    description: "",
    group_name: "",
    price: 0,
    image: "",
    variable_symbol: "",
    qr_session: "",
    account_number: "123456789",
    bank_code: "0100",
    ticket_id: null,
  };
  imagePreview.value = null;
  editingConcert.value = null;
};

const closeModal = () => {
  showAddModal.value = false;
  resetForm();
};

const handleSubmit = async () => {
  try {
    const concertData = {
      title: form.value.title,
      date: form.value.date,
      time: form.value.time || "19:00",
      description: form.value.description,
      group_name: form.value.group_name,
      price: form.value.price,
      image: form.value.image,
      variable_symbol: form.value.variable_symbol,
      qr_session: form.value.qr_session,
      account_number: form.value.account_number,
      bank_code: form.value.bank_code,
      ticket_id: form.value.ticket_id || null,
    };

    if (editingConcert.value) {
      await updateConcert(editingConcert.value.id, concertData);
      toast.success("Koncert byl úspěšně upraven");
    } else {
      await addConcert(concertData);
      toast.success("Koncert byl úspěšně přidán");
    }

    resetForm();
    showAddModal.value = false;
  } catch (err) {
    toast.error("Chyba při ukládání koncertu: " + err.message);
  }
};

const editConcert = (concert) => {
  editingConcert.value = concert;
  form.value = {
    title: concert.title,
    date: concert.date,
    time: concert.time || "",
    description: concert.description,
    group_name: concert.group_name,
    price: concert.price,
    image: concert.image,
    ticket_id: concert.ticket_id?.toString() || "",
    variable_symbol: concert.variable_symbol || "",
    account_number: concert.account_number || "123456789",
    bank_code: concert.bank_code || "0100",
    qr_session: concert.qr_session || "",
  };
  showAddModal.value = true;
};

const handleDelete = (id) => {
  concertToDelete.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  try {
    await deleteConcert(concertToDelete.value);
    await fetchConcerts();
    showDeleteModal.value = false;
    concertToDelete.value = null;
    toast.success("Koncert byl úspěšně smazán");
  } catch (err) {
    toast.error("Chyba při mazání koncertu: " + err.message);
  }
};

const fetchConcertTickets = async () => {
  try {
    const { data, error } = await supabase.from("concert_tickets").select("*");

    if (error) throw error;
    concertTickets.value = data;
  } catch (err) {
    toast.error("Chyba při načítání vstupenek: " + err.message);
  }
};

const editingTicket = ref(null);

const editTicket = (ticket) => {
  editingTicket.value = ticket;
  ticketForm.value = {
    title: ticket.title,
    group_id: ticket.group_id,
    provider: ticket.provider,
    ticket_url: ticket.ticket_url,
  };
  showTicketModal.value = true;
};

// Upravíme handleTicketSubmit pro podporu editace
const handleTicketSubmit = async () => {
  try {
    if (editingTicket.value) {
      // Editace existující vstupenky
      const { error } = await supabase
        .from("concert_tickets")
        .update(ticketForm.value)
        .eq("id", editingTicket.value.id);

      if (error) throw error;
      toast.success("Odkaz na vstupenky byl úspěšně upraven");
    } else {
      // Vytvoření nové vstupenky
      const { error } = await supabase
        .from("concert_tickets")
        .insert([ticketForm.value]);

      if (error) throw error;
      toast.success("Odkaz na vstupenky byl úspěšně přidán");
    }

    closeTicketModal();
  } catch (err) {
    toast.error("Chyba při ukládání odkazu: " + err.message);
  }
};

const closeTicketModal = () => {
  showTicketModal.value = false;
  editingTicket.value = null;
  ticketForm.value = {
    title: "",
    group_id: "",
    provider: "",
    ticket_url: "",
  };
  ticketCurrentPage.value = 1;
  fetchConcertTickets();
};

// Znovu načteme data při mounted
onMounted(async () => {
  await Promise.all([fetchConcerts(), fetchConcertTickets()]);
});

// Sledujeme změny v datech
watch(concerts, (newConcerts) => {
  // console.log("Admin concerts updated:", newConcerts);
});

// Přidáme funkci pro získání názvu tělesa podle ID
const getGroupName = (groupId) => {
  const groups = {
    "9001cdb8-80fd-4923-8aa9-8dedc9a30c77": "Marika Singers",
    "af581892-2252-462f-88f2-e73218b4e785": "Five",
    "ba4f5374-5d60-4354-a2ce-e83e130bba83": "Voices",
  };
  return groups[groupId] || "Neznámé těleso";
};

// Přidáme nové refs pro mazací modal
const showDeleteTicketModal = ref(false);
const ticketToDelete = ref(null);

// Přejmenujeme na handleDeleteTicket
const handleDeleteTicket = (id) => {
  ticketToDelete.value = id;
  showDeleteTicketModal.value = true;
};

// Přejmenujeme na confirmDeleteTicket
const confirmDeleteTicket = async () => {
  try {
    const { error } = await supabase
      .from("concert_tickets")
      .delete()
      .eq("id", ticketToDelete.value);

    if (error) throw error;

    await fetchConcertTickets();
    toast.success("Odkaz byl úspěšně smazán");
    showDeleteTicketModal.value = false;
    ticketToDelete.value = null;
  } catch (err) {
    toast.error("Chyba při mazání odkazu: " + err.message);
  }
};

// Přidáme computed property pro zobrazení/skrytí QR sekce
const showQRSection = computed(() => !form.value.ticket_id);

// Přidáme watch pro debugování
watch(
  () => form.value.ticket_id,
  (newVal, oldVal) => {
    console.log("ticket_id changed from", oldVal, "to", newVal);
    console.log("current form state:", form.value);
  }
);

// Upravíme existující computed property pro filtrované koncerty
const filteredConcerts = computed(() => {
  return concerts.value.filter((concert) => {
    const searchMatch = searchQuery.value
      ? concert.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        concert.description
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
      : true;

    const groupMatch = selectedGroup.value
      ? concert.group_name === selectedGroup.value
      : true;

    const ticketMatch = ticketFilter.value
      ? ticketFilter.value === "withTickets"
        ? concert.ticket_id
        : !concert.ticket_id
      : true;

    return searchMatch && groupMatch && ticketMatch;
  });
});

// Konstanty pro stránkování vstupenek
const TICKETS_PER_PAGE = 10;
const ticketCurrentPage = ref(1);

// Computed properties pro stránkování vstupenek
const ticketTotalPages = computed(() =>
  Math.ceil(concertTickets.value.length / TICKETS_PER_PAGE)
);

const ticketPaginationStart = computed(
  () => (ticketCurrentPage.value - 1) * TICKETS_PER_PAGE
);

const ticketPaginationEnd = computed(() =>
  Math.min(
    ticketPaginationStart.value + TICKETS_PER_PAGE,
    concertTickets.value.length
  )
);

const paginatedTickets = computed(() => {
  return concertTickets.value.slice(
    ticketPaginationStart.value,
    ticketPaginationEnd.value
  );
});

// Reset stránkování vstupenek při otevření modalu
watch(showTicketModal, (newValue) => {
  if (newValue) {
    ticketCurrentPage.value = 1;
  }
});

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});
</script>

<style scoped>
.material-icons-outlined {
  font-size: 20px;
}
</style>