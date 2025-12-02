<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-6 dark:bg-slate-900/80 dark:border-slate-800">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="rounded-full bg-red-50 text-red-600 p-3">
              <Icon name="mdi:account-group" class="text-2xl" />
            </div>
            <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">Seznam členů</h2>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            Seznam všech členů sboru rozdělených do oddílů.
          </p>
        </div>
        <button
          v-if="canCreateMember"
          @click="openCreateMemberModal"
          class="w-full md:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <Icon name="mdi:account-plus" class="text-lg mr-2" />
          Přidat člena
        </button>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-4">
          <div class="relative w-full">
            <Icon name="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              v-model="searchQuery"
              type="search"
              class="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
              placeholder="Hledat podle jména, e-mailu nebo telefonu..."
            />
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1">
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Oddíl</label>
              <select
                v-model="departmentFilter"
                class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
              >
                <option value="vse">Všechny oddíly</option>
                <option
                  v-for="dept in departments"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.display_name }}
                </option>
              </select>
            </div>
            <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800/60 dark:border-slate-700 px-3 py-2.5">
              <span class="text-xs font-medium text-slate-500 whitespace-nowrap">Řazení</span>
              <select
                v-model="sortKey"
                class="rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
              >
                <option value="surname">Příjmení</option>
                <option value="firstname">Jméno</option>
              </select>
              <select
                v-model="sortDir"
                class="rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
              >
                <option value="asc">↑</option>
                <option value="desc">↓</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 pt-1">
            <input
              id="active-only"
              v-model="activeOnly"
              type="checkbox"
              class="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
            />
            <label for="active-only" class="cursor-pointer">Pouze aktivní členové</label>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
      <!-- Mobilní zobrazení - karty -->
      <div class="md:hidden p-4 space-y-4">
        <div v-if="loading" class="py-10 text-center text-slate-500">
          <Icon name="mdi:loading" class="animate-spin text-2xl inline-block mr-2" />
          Načítám členy...
        </div>
        <div v-else-if="!filteredMembers.length" class="py-10 text-center text-slate-500">
          Žádní členové neodpovídají filtru.
        </div>
        <div
          v-for="member in filteredMembers"
          :key="member.id"
          class="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <NuxtLink :to="`/clenska-sekce/clenove/${getMemberSlug(member)}`" class="flex items-center gap-3 flex-1 min-w-0">
              <img
                v-if="member.avatar_url"
                :src="member.avatar_url"
                :alt="member.full_name"
                class="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div
                v-else
                class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0"
              >
                <Icon name="mdi:account" class="text-red-600 dark:text-red-400 text-xl" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ member.full_name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                  <span
                    class="inline-flex h-1.5 w-1.5 rounded-full mr-1"
                    :class="member.is_active ? 'bg-emerald-500' : 'bg-slate-300'"
                  />
                  {{ member.is_active ? 'Aktivní' : 'Neaktivní' }}
                </p>
              </div>
            </NuxtLink>
            <div v-if="canEditMember || canDeleteMember" class="flex items-center gap-2 flex-shrink-0">
              <button
                v-if="canEditMember"
                @click="openEditMemberModal(member)"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors p-1"
                title="Upravit"
              >
                <Icon name="mdi:pencil" class="text-xl" />
              </button>
              <button
                v-if="canDeleteMember"
                @click="openDeleteMemberModal(member)"
                class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors p-1"
                title="Smazat"
              >
                <Icon name="mdi:delete" class="text-xl" />
              </button>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div>
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Oddíl:</span>
              <div class="flex flex-wrap gap-1.5 items-center mt-1">
                <template v-if="getMemberDepartments(member).length === 0">
                  <span class="text-slate-400 text-xs">—</span>
                </template>
                <template v-else>
                  <span
                    v-for="(dept, index) in getMemberDepartments(member).slice(0, 2)"
                    :key="dept.id"
                    class="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/30 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300"
                  >
                    {{ dept.display_name }}
                  </span>
                  <template v-if="getMemberDepartments(member).length > 2">
                    <button
                      @click="toggleDepartmentTooltip(member.id, $event)"
                      class="inline-flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors cursor-pointer min-w-[28px]"
                      :class="{ 'bg-red-200 dark:bg-red-900/70': visibleTooltips[member.id] }"
                    >
                      +{{ getMemberDepartments(member).length - 2 }}
                    </button>
                    <Transition
                      enter-active-class="transition ease-out duration-200"
                      enter-from-class="opacity-0 scale-95"
                      enter-to-class="opacity-100 scale-100"
                      leave-active-class="transition ease-in duration-150"
                      leave-from-class="opacity-100 scale-100"
                      leave-to-class="opacity-0 scale-95"
                    >
                      <div
                        v-if="visibleTooltips[member.id]"
                        class="inline-flex flex-wrap gap-1.5 ml-1"
                        @click.stop
                      >
                        <span
                          v-for="dept in getMemberDepartments(member).slice(2)"
                          :key="dept.id"
                          class="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/30 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300"
                        >
                          {{ dept.display_name }}
                        </span>
                      </div>
                    </Transition>
                  </template>
                </template>
              </div>
            </div>

            <div v-if="member.email || member.phone">
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Kontakty:</span>
              <div class="space-y-1 mt-1">
                <p v-if="member.email" class="text-xs">
                  <Icon name="mdi:email-outline" class="inline mr-1 text-red-500 text-sm" />
                  <a :href="`mailto:${member.email}`" class="hover:underline text-red-600 dark:text-red-300 break-all">{{ member.email }}</a>
                </p>
                <p v-if="member.phone" class="text-xs">
                  <Icon name="mdi:phone" class="inline mr-1 text-red-500 text-sm" />
                  <a :href="`tel:${member.phone}`" class="hover:underline text-red-600 dark:text-red-300">{{ member.phone }}</a>
                </p>
              </div>
            </div>

            <div v-if="member.notes">
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Poznámka:</span>
              <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{{ member.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop zobrazení - tabulka -->
      <div class="hidden md:block overflow-hidden rounded-2xl">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead class="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Člen</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Oddíl</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Kontakty</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Poznámka</th>
                <th v-if="canEditMember || canDeleteMember" class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Akce</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200 dark:bg-slate-900 dark:divide-slate-800">
              <tr v-if="loading">
                <td :colspan="canEditMember || canDeleteMember ? 5 : 4" class="px-4 py-10 text-center text-slate-500">
                  <Icon name="mdi:loading" class="animate-spin text-2xl inline-block mr-2" />
                  Načítám členy...
                </td>
              </tr>
              <tr v-else-if="!filteredMembers.length">
                <td :colspan="canEditMember || canDeleteMember ? 5 : 4" class="px-4 py-10 text-center text-slate-500">
                  Žádní členové neodpovídají filtru.
                </td>
              </tr>
              <tr
                v-for="member in filteredMembers"
                :key="member.id"
                class="hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/60"
              >
                <td class="px-4 py-3">
                  <NuxtLink :to="`/clenska-sekce/clenove/${getMemberSlug(member)}`" class="flex items-center gap-3 hover:underline">
                    <img
                      v-if="member.avatar_url"
                      :src="member.avatar_url"
                      :alt="member.full_name"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                    <div
                      v-else
                      class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
                    >
                      <Icon name="mdi:account" class="text-red-600 dark:text-red-400 text-xl" />
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ member.full_name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">
                        <span
                          class="inline-flex h-1.5 w-1.5 rounded-full mr-1"
                          :class="member.is_active ? 'bg-emerald-500' : 'bg-slate-300'"
                        />
                        {{ member.is_active ? 'Aktivní' : 'Neaktivní' }}
                      </p>
                    </div>
                  </NuxtLink>
                </td>
                <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  <div class="flex flex-wrap gap-1.5 items-center">
                    <template v-if="getMemberDepartments(member).length === 0">
                      <span class="text-slate-400">—</span>
                    </template>
                    <template v-else>
                      <span
                        v-for="(dept, index) in getMemberDepartments(member).slice(0, 2)"
                        :key="dept.id"
                        class="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/30 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300"
                      >
                        {{ dept.display_name }}
                      </span>
                      <template v-if="getMemberDepartments(member).length > 2">
                        <button
                          @click="toggleDepartmentTooltip(member.id, $event)"
                          class="inline-flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors cursor-pointer min-w-[28px]"
                          :class="{ 'bg-red-200 dark:bg-red-900/70': visibleTooltips[member.id] }"
                        >
                          +{{ getMemberDepartments(member).length - 2 }}
                        </button>
                        <Transition
                          enter-active-class="transition ease-out duration-200"
                          enter-from-class="opacity-0 scale-95"
                          enter-to-class="opacity-100 scale-100"
                          leave-active-class="transition ease-in duration-150"
                          leave-from-class="opacity-100 scale-100"
                          leave-to-class="opacity-0 scale-95"
                        >
                          <div
                            v-if="visibleTooltips[member.id]"
                            class="inline-flex flex-wrap gap-1.5 ml-1"
                            @click.stop
                          >
                            <span
                              v-for="dept in getMemberDepartments(member).slice(2)"
                              :key="dept.id"
                              class="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/30 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300"
                            >
                              {{ dept.display_name }}
                            </span>
                          </div>
                        </Transition>
                      </template>
                    </template>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  <div class="space-y-1">
                    <p v-if="member.email">
                      <Icon name="mdi:email-outline" class="inline mr-1 text-red-500" />
                      <a :href="`mailto:${member.email}`" class="hover:underline text-red-600 dark:text-red-300">{{ member.email }}</a>
                    </p>
                    <p v-if="member.phone">
                      <Icon name="mdi:phone" class="inline mr-1 text-red-500" />
                      <a :href="`tel:${member.phone}`" class="hover:underline text-red-600 dark:text-red-300">{{ member.phone }}</a>
                    </p>
                    <p v-if="!member.email && !member.phone" class="text-slate-400">—</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 max-w-xs">
                  <p class="line-clamp-2 text-slate-600 dark:text-slate-300">{{ member.notes || '—' }}</p>
                </td>
                <td v-if="canEditMember || canDeleteMember" class="px-4 py-3 text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <button
                      v-if="canEditMember"
                      @click="openEditMemberModal(member)"
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      title="Upravit"
                    >
                      <Icon name="mdi:pencil" class="text-xl" />
                    </button>
                    <button
                      v-if="canDeleteMember"
                      @click="openDeleteMemberModal(member)"
                      class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                      title="Smazat"
                    >
                      <Icon name="mdi:delete" class="text-xl" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Sekce pro správu práv oddílů (pouze pro adminy/editory) -->
    <section v-if="canManageDepartments" class="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-6 dark:bg-slate-900/80 dark:border-slate-800">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="rounded-full bg-violet-50 text-violet-600 p-3">
              <Icon name="mdi:security" class="text-2xl" />
            </div>
            <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">Správa práv oddílů</h2>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            Nastavte oprávnění pro jednotlivé oddíly v členské sekci.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="dept in departments"
          :key="dept.id"
          class="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4 md:p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-base md:text-lg font-semibold text-slate-900 dark:text-white truncate">{{ dept.display_name }}</h3>
              <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">{{ dept.name }}</p>
            </div>
            <span
              :class="[
                'px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0',
                dept.is_active
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
              ]"
            >
              {{ dept.is_active ? 'Aktivní' : 'Neaktivní' }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-600 dark:text-slate-400">Repertoár</span>
              <div class="flex items-center gap-2">
                <span v-if="dept.permissions?.repertoire_view" class="text-emerald-600 dark:text-emerald-400">Zobrazit</span>
                <span v-if="dept.permissions?.repertoire_edit" class="text-violet-600 dark:text-violet-400">Upravit</span>
                <span v-if="!dept.permissions?.repertoire_view" class="text-slate-400">—</span>
              </div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-600 dark:text-slate-400">Seznam členů</span>
              <span :class="dept.permissions?.member_directory_view ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'">
                {{ dept.permissions?.member_directory_view ? 'Povoleno' : 'Zakázáno' }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-600 dark:text-slate-400">Dokumenty</span>
              <div class="flex items-center gap-2">
                <span v-if="dept.permissions?.member_resources_view" class="text-emerald-600 dark:text-emerald-400">Zobrazit</span>
                <span v-if="dept.permissions?.member_resources_upload" class="text-violet-600 dark:text-violet-400">Nahrávat</span>
                <span v-if="!dept.permissions?.member_resources_view" class="text-slate-400">—</span>
              </div>
            </div>
          </div>

          <button
            @click="openEditPermissionsModal(dept)"
            class="w-full inline-flex items-center justify-center px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Icon name="mdi:pencil" class="text-lg mr-2" />
            Upravit práva
          </button>
        </div>
      </div>
    </section>

    <!-- Modal pro úpravu práv oddílu -->
    <TransitionRoot appear :show="showPermissionsModal" as="template">
      <Dialog as="div" @close="showPermissionsModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-violet-100 dark:bg-violet-900/30 rounded-full">
                  <Icon name="mdi:security" class="text-violet-600 dark:text-violet-400 text-3xl" />
                </div>

                <DialogTitle class="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  Upravit práva oddílu
                </DialogTitle>
                <p class="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                  Nastavte oprávnění pro oddíl <strong class="text-gray-900 dark:text-white">{{ editingDepartmentPermissions?.display_name }}</strong>
                </p>

                <form @submit.prevent="handlePermissionsSubmit" class="space-y-6">
                  <div class="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                    <h4 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Icon name="mdi:security" class="text-[20px] mr-2 text-violet-600 dark:text-violet-400" />
                      Oprávnění v členské sekci
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Nastavte, co mohou členové tohoto oddílu v členské sekci dělat
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="permissionsForm.repertoire_view"
                          type="checkbox"
                          id="perm-repertoire-view-modal"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-repertoire-view-modal" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <Icon name="mdi:music-note" class="text-[18px] mr-2 text-gray-500" />
                            Zobrazit repertoár
                          </span>
                        </label>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="permissionsForm.repertoire_edit"
                          type="checkbox"
                          id="perm-repertoire-edit-modal"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-repertoire-edit-modal" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <Icon name="mdi:edit" class="text-[18px] mr-2 text-gray-500" />
                            Upravovat repertoár
                          </span>
                        </label>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="permissionsForm.member_directory_view"
                          type="checkbox"
                          id="perm-members-view-modal"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-members-view-modal" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <Icon name="mdi:contacts" class="text-[18px] mr-2 text-gray-500" />
                            Seznam členů
                          </span>
                        </label>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="permissionsForm.members_area_view"
                          type="checkbox"
                          id="perm-area-view-modal"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-area-view-modal" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <Icon name="mdi:login" class="text-[18px] mr-2 text-gray-500" />
                            Přístup do sekce
                          </span>
                        </label>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="permissionsForm.member_resources_view"
                          type="checkbox"
                          id="perm-resources-view-modal"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-resources-view-modal" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <Icon name="mdi:folder" class="text-[18px] mr-2 text-gray-500" />
                            Zobrazit dokumenty
                          </span>
                        </label>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="permissionsForm.member_resources_upload"
                          type="checkbox"
                          id="perm-resources-upload-modal"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-resources-upload-modal" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <Icon name="mdi:upload" class="text-[18px] mr-2 text-gray-500" />
                            Nahrávat dokumenty
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- Práva pro správu členů -->
                  <div class="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                    <h4 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Icon name="mdi:account-group" class="text-[20px] mr-2 text-violet-600 dark:text-violet-400" />
                      Práva pro správu členů
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Nastavte, zda mohou členové tohoto oddílu přidávat, upravovat a mazat členy v sekci Seznam členů
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="permissionsForm.member_management_create"
                          type="checkbox"
                          id="perm-member-create-modal"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-member-create-modal" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <Icon name="mdi:account-plus" class="text-[18px] mr-2 text-gray-500" />
                            Přidávat členy
                          </span>
                        </label>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="permissionsForm.member_management_edit"
                          type="checkbox"
                          id="perm-member-edit-modal"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-member-edit-modal" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <Icon name="mdi:pencil" class="text-[18px] mr-2 text-gray-500" />
                            Upravovat členy
                          </span>
                        </label>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="permissionsForm.member_management_delete"
                          type="checkbox"
                          id="perm-member-delete-modal"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-member-delete-modal" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <Icon name="mdi:delete" class="text-[18px] mr-2 text-gray-500" />
                            Mazat členy
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-end gap-3 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      @click="showPermissionsModal = false"
                      class="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:ring-4 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="updatingPermissions"
                    >
                      <Icon v-if="updatingPermissions" name="mdi:loading" class="text-lg mr-2 animate-spin" />
                      <Icon v-else name="mdi:check" class="text-lg mr-2" />
                      {{ updatingPermissions ? 'Ukládám...' : 'Uložit změny' }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal pro vytváření/úpravu člena -->
    <TransitionRoot appear :show="showMemberModal" as="template">
      <Dialog as="div" @close="showMemberModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <DialogTitle class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {{ editingMember ? 'Upravit člena' : 'Přidat člena' }}
                </DialogTitle>

                <form @submit.prevent="handleMemberSubmit" class="space-y-6">
                  <!-- Profilová fotografie -->
                  <div
                    class="bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 p-6 rounded-xl border-2 border-red-100 dark:border-gray-700"
                    :class="{ 'border-dashed ring-2 ring-red-300 dark:ring-red-700': isDragOverAvatar }"
                    @dragover.prevent="onAvatarDragOver"
                    @dragenter.prevent="onAvatarDragOver"
                    @dragleave.prevent="onAvatarDragLeave"
                    @drop.prevent="onAvatarDrop"
                  >
                    <label class="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-4">
                      <Icon name="mdi:camera" class="text-[20px] mr-2 text-red-600 dark:text-red-400" />
                      Profilová fotografie (volitelná)
                      <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">(přetáhněte sem obrázek nebo klikněte pro výběr)</span>
                    </label>
                    <div class="flex items-center gap-6">
                      <div class="relative">
                        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                          <img v-if="avatarPreview || memberForm.avatar_url" :src="avatarPreview || memberForm.avatar_url" class="w-full h-full object-cover" />
                          <Icon v-else name="mdi:account" class="text-red-300 dark:text-gray-500 text-5xl" />
                        </div>
                        <div v-if="avatarPreview || memberForm.avatar_url" class="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                          <Icon name="mdi:check" class="text-white text-[16px]" />
                        </div>
                      </div>
                      <div class="flex-1">
                        <input
                          ref="avatarInput"
                          type="file"
                          accept="image/*"
                          @change="handleAvatarChange"
                          class="hidden"
                        />
                        <div class="flex flex-wrap gap-3">
                          <button
                            type="button"
                            @click="() => avatarInput?.click()"
                            class="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 border-2 border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-gray-600 transition-all"
                          >
                            <Icon name="mdi:upload" class="text-[18px] mr-2" />
                            {{ (avatarPreview || memberForm.avatar_url) ? 'Změnit fotku' : 'Nahrát fotku' }}
                          </button>
                          <button
                            v-if="avatarPreview || memberForm.avatar_url"
                            type="button"
                            @click="clearAvatar"
                            class="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 border-2 border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-gray-600 transition-all"
                          >
                            <Icon name="mdi:delete" class="text-[18px] mr-2" />
                            Odstranit
                          </button>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
                          Doporučený formát: JPG, PNG. Maximální velikost: 5 MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Základní informace -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span class="flex items-center">
                          <Icon name="mdi:account" class="text-[18px] mr-2 text-red-600 dark:text-red-400" />
                          Jméno a příjmení <span class="text-red-500 ml-1">*</span>
                        </span>
                      </label>
                      <input
                        v-model="memberForm.full_name"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all"
                        placeholder="Jana Nováková"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span class="flex items-center">
                          <Icon name="mdi:account-group" class="text-[18px] mr-2 text-red-600 dark:text-red-400" />
                          Oddíly <span class="text-red-500 ml-1">*</span>
                        </span>
                      </label>
                      <MultiTagSelect
                        v-model="memberForm.department_ids"
                        :options="departments.map(dept => ({ value: dept.id, label: dept.display_name }))"
                        placeholder="Vyberte oddíly..."
                        :required="true"
                        :get-tag-name="(id) => departments.find(d => d.id === id)?.display_name || id"
                        :get-tag-style="() => ({ backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' })"
                        input-class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span class="flex items-center">
                          <Icon name="mdi:cake" class="text-[18px] mr-2 text-red-600 dark:text-red-400" />
                          Datum narození
                        </span>
                      </label>
                      <input
                        v-model="memberForm.birth_date"
                        type="date"
                        class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span class="flex items-center">
                          <Icon name="mdi:map-marker" class="text-[18px] mr-2 text-red-600 dark:text-red-400" />
                          Místo narození
                        </span>
                      </label>
                      <input
                        v-model="memberForm.birth_place"
                        type="text"
                        class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all"
                        placeholder="Praha"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span class="flex items-center">
                          <Icon name="mdi:email" class="text-[18px] mr-2 text-red-600 dark:text-red-400" />
                          Email
                        </span>
                      </label>
                      <input
                        v-model="memberForm.email"
                        type="email"
                        class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all"
                        placeholder="jana@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span class="flex items-center">
                        <Icon name="mdi:phone" class="text-[18px] mr-2 text-red-600 dark:text-red-400" />
                        Telefon
                      </span>
                    </label>
                    <input
                      v-model="memberForm.phone"
                      type="tel"
                      class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all"
                      placeholder="+420 123 456 789"
                    />
                  </div>

                  <!-- Adresa -->
                  <div class="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                    <h4 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Icon name="mdi:home" class="text-[20px] mr-2 text-red-600 dark:text-red-400" />
                      Adresa
                    </h4>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div class="md:col-span-3">
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Ulice a číslo
                        </label>
                        <input
                          v-model="memberForm.street"
                          type="text"
                          class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all"
                          placeholder="Bezručova 337"
                        />
                      </div>

                      <div class="md:col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Město
                        </label>
                        <input
                          v-model="memberForm.city"
                          type="text"
                          class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all"
                          placeholder="Praha"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          PSČ
                        </label>
                        <input
                          v-model="memberForm.postal_code"
                          type="text"
                          class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all"
                          placeholder="252 63"
                        />
                      </div>

                      <div class="md:col-span-3">
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Celá adresa (automaticky)
                        </label>
                        <input
                          v-model="memberForm.full_address"
                          type="text"
                          class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all"
                          placeholder="Bezručova 337, 252 63 Roztoky"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Poznámky -->
                  <div class="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span class="flex items-center">
                        <Icon name="mdi:note-text" class="text-[18px] mr-2 text-red-600 dark:text-red-400" />
                        Poznámky
                      </span>
                    </label>
                    <textarea
                      v-model="memberForm.notes"
                      rows="3"
                      class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition-all resize-none"
                      placeholder="Volitelné poznámky o členovi..."
                    />
                  </div>

                  <!-- Status -->
                  <div class="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                    <input
                      v-model="memberForm.is_active"
                      type="checkbox"
                      id="member-active-modal"
                      class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-2 focus:ring-red-500 transition-all"
                    />
                    <label for="member-active-modal" class="ml-3 flex items-center cursor-pointer">
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">
                        Aktivní člen
                      </span>
                      <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        (může se přihlašovat do členské sekce)
                      </span>
                    </label>
                  </div>

                  <div class="flex justify-end gap-3 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      @click="closeMemberModal"
                      class="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="loading"
                    >
                      <Icon v-if="loading" name="mdi:loading" class="text-lg mr-2 animate-spin" />
                      <Icon v-else name="mdi:check" class="text-lg mr-2" />
                      {{ loading ? 'Ukládám...' : (editingMember ? 'Uložit změny' : 'Přidat člena') }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal pro potvrzení mazání člena -->
    <TransitionRoot appear :show="showDeleteMemberModal" as="template">
      <Dialog as="div" @close="showDeleteMemberModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <Icon name="mdi:alert" class="text-red-600 dark:text-red-400 text-2xl" />
                </div>

                <DialogTitle class="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  Smazat člena?
                </DialogTitle>

                <p class="text-gray-600 dark:text-gray-400 text-center mb-6">
                  Opravdu chcete smazat člena <strong class="text-gray-900 dark:text-white">{{ memberToDelete?.full_name }}</strong>?
                  <br />
                  Tuto akci nelze vrátit zpět.
                </p>

                <div class="flex gap-3">
                  <button
                    type="button"
                    @click="showDeleteMemberModal = false"
                    class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Zrušit
                  </button>
                  <button
                    type="button"
                    @click="handleDeleteMember"
                    class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    :disabled="loading"
                  >
                    {{ loading ? 'Mazání...' : 'Smazat' }}
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useSupabaseClient } from '#imports'
import { useToast } from '~/composables/useToast'
import { useMemberManagement, type MemberUser } from '~/composables/useMemberManagement'
import { useMemberDepartments, type MemberDepartment, type DepartmentPermissions } from '~/composables/useMemberDepartments'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import MultiTagSelect from '~/components/MultiTagSelect.vue'
import { slugify } from '~/utils/string'

definePageMeta({
  layout: 'members'
})

const toast = useToast()
const router = useRouter()
const supabase = useSupabaseClient()

const {
  members,
  loading,
  fetchMembers,
  createMember,
  updateMember,
  deleteMember
} = useMemberManagement()

const {
  departments,
  fetchDepartments,
  updateDepartment
} = useMemberDepartments()

// Kontrola oprávnění pro správu oddílů
const canManageDepartments = ref(false)
const showPermissionsModal = ref(false)
const editingDepartmentPermissions = ref<MemberDepartment | null>(null)
const updatingPermissions = ref(false)
const permissionsForm = ref<DepartmentPermissions>({
  repertoire_view: true,
  repertoire_edit: false,
  member_directory_view: true,
  members_area_view: true,
  member_resources_view: true,
  member_resources_upload: false,
  member_management_create: false,
  member_management_edit: false,
  member_management_delete: false
})

// Kontrola oprávnění pro správu členů na základě přihlášeného oddílu
const currentDepartment = ref<MemberDepartment | null>(null)
const userRole = ref<'admin' | 'editor' | null>(null)

// Kontrola role uživatele
const checkUserRole = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      userRole.value = null
      return
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('email', user.email)
      .single()

    userRole.value = roleData?.role === 'admin' || roleData?.role === 'editor' ? roleData.role : null
  } catch (err) {
    console.error('Chyba při kontrole role:', err)
    userRole.value = null
  }
}

// Computed pro oprávnění - Admin a Editor mají vždy práva, jinak se kontrolují práva oddílu
const canCreateMember = computed(() => {
  const isAdminOrEditor = userRole.value === 'admin' || userRole.value === 'editor'
  const hasPermission = currentDepartment.value?.permissions?.member_management_create === true

  if (process.client) {
    console.log('canCreateMember check:', {
      userRole: userRole.value,
      isAdminOrEditor,
      currentDepartment: currentDepartment.value?.display_name,
      permissions: currentDepartment.value?.permissions,
      hasPermission,
      result: isAdminOrEditor || hasPermission
    })
  }

  return isAdminOrEditor || hasPermission
})

const canEditMember = computed(() => {
  const isAdminOrEditor = userRole.value === 'admin' || userRole.value === 'editor'
  const hasPermission = currentDepartment.value?.permissions?.member_management_edit === true

  if (process.client) {
    console.log('canEditMember check:', {
      userRole: userRole.value,
      isAdminOrEditor,
      currentDepartment: currentDepartment.value?.display_name,
      permissions: currentDepartment.value?.permissions,
      hasPermission,
      result: isAdminOrEditor || hasPermission
    })
  }

  return isAdminOrEditor || hasPermission
})

const canDeleteMember = computed(() => {
  const isAdminOrEditor = userRole.value === 'admin' || userRole.value === 'editor'
  const hasPermission = currentDepartment.value?.permissions?.member_management_delete === true

  if (process.client) {
    console.log('canDeleteMember check:', {
      userRole: userRole.value,
      isAdminOrEditor,
      currentDepartment: currentDepartment.value?.display_name,
      permissions: currentDepartment.value?.permissions,
      hasPermission,
      result: isAdminOrEditor || hasPermission
    })
  }

  return isAdminOrEditor || hasPermission
})

// Modaly pro správu členů
const showMemberModal = ref(false)
const showDeleteMemberModal = ref(false)
const editingMember = ref<any>(null)
const memberToDelete = ref<any>(null)
const memberForm = ref({
  full_name: '',
  department_ids: [] as string[],
  email: '',
  phone: '',
  street: '',
  city: '',
  postal_code: '',
  full_address: '',
  birth_date: '',
  birth_place: '',
  notes: '',
  avatar_url: '',
  is_active: true
})

const avatarPreview = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const avatarInput = ref<HTMLInputElement | null>(null)
const isDragOverAvatar = ref(false)

// Tooltip pro zobrazení všech oddílů
const visibleTooltips = ref<Record<string, boolean>>({})

const toggleDepartmentTooltip = (memberId: string, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  visibleTooltips.value[memberId] = !visibleTooltips.value[memberId]
}

// Zavření tooltipu při kliknutí mimo něj
const closeTooltipsOnClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.department-tooltip-container')) {
    // Zavřeme všechny tooltips
    Object.keys(visibleTooltips.value).forEach(key => {
      visibleTooltips.value[key] = false
    })
  }
}

// Načtení nastavení řazení z localStorage
const getSavedSortKey = (): 'surname' | 'firstname' => {
  if (typeof window === 'undefined') return 'surname'
  const saved = localStorage.getItem('members-sort-key')
  return (saved === 'firstname' || saved === 'surname') ? saved : 'surname'
}

const getSavedSortDir = (): 'asc' | 'desc' => {
  if (typeof window === 'undefined') return 'asc'
  const saved = localStorage.getItem('members-sort-dir')
  return (saved === 'asc' || saved === 'desc') ? saved : 'asc'
}

const searchQuery = ref('')
const departmentFilter = ref<'vse' | string>('vse')
const activeOnly = ref(false)
const sortKey = ref<'surname' | 'firstname'>(getSavedSortKey())
const sortDir = ref<'asc' | 'desc'>(getSavedSortDir())

// Ukládání nastavení řazení do localStorage
watch(sortKey, (newValue) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('members-sort-key', newValue)
  }
})

watch(sortDir, (newValue) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('members-sort-dir', newValue)
  }
})

const normalize = (value: string) =>
  value
    ? value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    : ''

// Funkce pro vytvoření slug z jména člena
const getMemberSlug = (member: MemberUser): string => {
  return slugify(member.full_name)
}

const getLastName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/)
  return parts.length > 0 ? parts[parts.length - 1] : ''
}

const getFirstName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/)
  return parts.length > 0 ? parts[0] : ''
}

const filteredMembers = computed(() => {
  const query = normalize(searchQuery.value)

  const filtered = members.value.filter((member) => {
    if (activeOnly.value && !member.is_active) return false

    if (departmentFilter.value !== 'vse') {
      // Kontrola hlavního oddílu nebo oddílů v member_user_departments
      const memberDepts = getMemberDepartments(member)
      const hasMatchingDept = member.department_id === departmentFilter.value ||
        memberDepts.some((d: any) => d.id === departmentFilter.value)
      if (!hasMatchingDept) return false
    }

    if (!query) return true

    const haystack = `${member.full_name} ${member.email ?? ''} ${member.phone ?? ''} ${member.notes ?? ''}`
    return normalize(haystack).includes(query)
  })

  // Řazení
  const sorted = [...filtered].sort((a, b) => {
    let aValue = ''
    let bValue = ''

    if (sortKey.value === 'surname') {
      aValue = normalize(getLastName(a.full_name))
      bValue = normalize(getLastName(b.full_name))
    } else {
      aValue = normalize(getFirstName(a.full_name))
      bValue = normalize(getFirstName(b.full_name))
    }

    const dir = sortDir.value === 'asc' ? 1 : -1

    if (aValue < bValue) return -1 * dir
    if (aValue > bValue) return 1 * dir
    return 0
  })

  return sorted
})

const getDepartmentName = (departmentId: string) => {
  const dept = departments.value.find(d => d.id === departmentId)
  return dept?.display_name || '—'
}

// Funkce pro získání oddílů člena
const getMemberDepartments = (member: MemberUser) => {
  // Debug logy pouze pro konkrétního člena "test"
  if (member.full_name === 'test') {
    console.log('getMemberDepartments for member "test":', {
      id: member.id,
      name: member.full_name,
      departments: member.departments,
      department_id: member.department_id,
      member_object: member
    })
  }

  if (member.departments && member.departments.length > 0) {
    if (member.full_name === 'test') {
      console.log('Returning departments from member.departments:', member.departments)
    }
    return member.departments
  }

  // Fallback na starý department
  if (member.department_id) {
    const dept = departments.value.find(d => d.id === member.department_id)
    if (dept) {
      if (member.full_name === 'test') {
        console.log('Returning fallback department:', dept)
      }
      return [{ id: dept.id, display_name: dept.display_name }]
    }
  }

  if (member.full_name === 'test') {
    console.log('No departments found, returning empty array')
  }
  return []
}

// Kontrola oprávnění pro správu oddílů
const checkManagePermissions = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      canManageDepartments.value = false
      return
    }

    // Kontrola, zda je uživatel admin nebo editor s oprávněním member_departments.edit
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('email', user.email)
      .single()

    if (roleData?.role === 'admin') {
      canManageDepartments.value = true
      return
    }

    if (roleData?.role === 'editor') {
      const { data: hasPermission } = await supabase
        .rpc('check_permission', {
          p_email: user.email,
          p_section: 'member_departments',
          p_action: 'edit'
        })

      canManageDepartments.value = Boolean(hasPermission)
    } else {
      canManageDepartments.value = false
    }
  } catch (err) {
    console.error('Chyba při kontrole oprávnění:', err)
    canManageDepartments.value = false
  }
}

const openEditPermissionsModal = (dept: MemberDepartment) => {
  editingDepartmentPermissions.value = dept
  permissionsForm.value = {
    repertoire_view: dept.permissions?.repertoire_view ?? true,
    repertoire_edit: dept.permissions?.repertoire_edit ?? false,
    member_directory_view: dept.permissions?.member_directory_view ?? true,
    members_area_view: dept.permissions?.members_area_view ?? true,
    member_resources_view: dept.permissions?.member_resources_view ?? true,
    member_resources_upload: dept.permissions?.member_resources_upload ?? false,
    member_management_create: dept.permissions?.member_management_create ?? false,
    member_management_edit: dept.permissions?.member_management_edit ?? false,
    member_management_delete: dept.permissions?.member_management_delete ?? false
  }
  showPermissionsModal.value = true
}

const handlePermissionsSubmit = async () => {
  if (!editingDepartmentPermissions.value) return

  try {
    updatingPermissions.value = true
    await updateDepartment(editingDepartmentPermissions.value.id, {
      permissions: permissionsForm.value
    })
    toast.success('Práva oddílu byla úspěšně aktualizována')
    showPermissionsModal.value = false
    await fetchDepartments()
  } catch (err: any) {
    console.error('Chyba při aktualizaci práv:', err)
    toast.error('Nepodařilo se aktualizovat práva oddílu')
  } finally {
    updatingPermissions.value = false
  }
}

// Načtení aktuálního oddílu z localStorage
const loadCurrentDepartment = async () => {
  if (typeof window === 'undefined') return

  try {
    const memberDepartment = localStorage.getItem('memberDepartment')
    if (memberDepartment) {
      const dept = JSON.parse(memberDepartment)

      // Pokud máme oddíl, načteme jeho aktuální data včetně práv z databáze
      if (dept?.id) {
        const { data: deptData, error } = await supabase
          .from('member_departments')
          .select('*')
          .eq('id', dept.id)
          .single()

        if (error) {
          console.error('Chyba při načítání oddílu z databáze:', error)
          // Fallback na data z localStorage
          currentDepartment.value = dept as MemberDepartment
        } else if (deptData) {
          // Zajistíme, že permissions obsahují všechna pole
          const fullPermissions = {
            repertoire_view: deptData.permissions?.repertoire_view ?? true,
            repertoire_edit: deptData.permissions?.repertoire_edit ?? false,
            member_directory_view: deptData.permissions?.member_directory_view ?? true,
            members_area_view: deptData.permissions?.members_area_view ?? true,
            member_resources_view: deptData.permissions?.member_resources_view ?? true,
            member_resources_upload: deptData.permissions?.member_resources_upload ?? false,
            member_management_create: deptData.permissions?.member_management_create ?? false,
            member_management_edit: deptData.permissions?.member_management_edit ?? false,
            member_management_delete: deptData.permissions?.member_management_delete ?? false
          }

          const updatedDept = {
            ...deptData,
            permissions: fullPermissions
          } as MemberDepartment

          currentDepartment.value = updatedDept

          // Aktualizujeme také localStorage s aktuálními právy
          localStorage.setItem('memberDepartment', JSON.stringify(updatedDept))

          console.log('Načtený oddíl s právy:', {
            id: currentDepartment.value.id,
            display_name: currentDepartment.value.display_name,
            permissions: currentDepartment.value.permissions
          })
        } else {
          // Fallback na data z localStorage
          currentDepartment.value = dept as MemberDepartment
        }
      } else {
        currentDepartment.value = dept as MemberDepartment
      }
    }
  } catch (err) {
    console.error('Chyba při načítání aktuálního oddílu:', err)
  }
}

// Funkce pro správu členů
const openCreateMemberModal = () => {
  editingMember.value = null
  memberForm.value = {
    full_name: '',
    department_ids: [],
    email: '',
    phone: '',
    street: '',
    city: '',
    postal_code: '',
    full_address: '',
    birth_date: '',
    birth_place: '',
    notes: '',
    avatar_url: '',
    is_active: true
  }
  avatarPreview.value = null
  avatarFile.value = null
  showMemberModal.value = true
}

const openEditMemberModal = async (member: MemberUser) => {
  // Nejprve načteme aktuální data člena z databáze, aby měl vždy nejnovější stav
  try {
    const { data: currentMember, error } = await supabase
      .from('member_users')
      .select(`
        *,
        member_user_departments (
          department_id,
          member_departments (
            id,
            display_name
          )
        )
      `)
      .eq('id', member.id)
      .single()

    if (error) {
      console.error('Error loading current member:', error)
      // Fallback na původní member objekt
      editingMember.value = member
    } else if (currentMember) {
      // Převod na formát MemberUser s departments
      const memberWithDepartments: MemberUser = {
        ...currentMember,
        departments: currentMember.member_user_departments?.map((mud: any) => ({
          id: mud.member_departments?.id || mud.department_id,
          display_name: mud.member_departments?.display_name || ''
        })) || []
      }
      editingMember.value = memberWithDepartments
    } else {
      editingMember.value = member
    }
  } catch (err) {
    console.error('Error loading current member:', err)
    editingMember.value = member
  }

  // Načtení oddílů člena z pomocné tabulky
  let departmentIds: string[] = []
  try {
    const { data: memberDepartments } = await supabase
      .from('member_user_departments')
      .select('department_id')
      .eq('member_user_id', editingMember.value.id)

    if (memberDepartments && memberDepartments.length > 0) {
      departmentIds = memberDepartments.map((md: any) => md.department_id)
    } else if (editingMember.value.department_id) {
      departmentIds = [editingMember.value.department_id]
    }
  } catch (err) {
    console.error('Error loading member departments:', err)
    if (editingMember.value.department_id) {
      departmentIds = [editingMember.value.department_id]
    }
  }

  memberForm.value = {
    full_name: member.full_name,
    department_ids: departmentIds,
    email: member.email || '',
    phone: member.phone || '',
    street: member.street || '',
    city: member.city || '',
    postal_code: member.postal_code || '',
    full_address: member.full_address || '',
    birth_date: member.birth_date || '',
    birth_place: member.birth_place || '',
    notes: member.notes || '',
    avatar_url: member.avatar_url || '',
    is_active: member.is_active
  }
  avatarPreview.value = member.avatar_url || null
  avatarFile.value = null
  showMemberModal.value = true
}

const closeMemberModal = () => {
  showMemberModal.value = false
  editingMember.value = null
  memberForm.value = {
    full_name: '',
    department_ids: [],
    email: '',
    phone: '',
    street: '',
    city: '',
    postal_code: '',
    full_address: '',
    birth_date: '',
    birth_place: '',
    notes: '',
    avatar_url: '',
    is_active: true
  }
  avatarPreview.value = null
  avatarFile.value = null
  isDragOverAvatar.value = false
}

// Funkce pro nahrávání avatara
const uploadingAvatar = ref(false)

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Povolené mime types včetně SVG
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ]

  if (!allowedMimeTypes.includes(file.type)) {
    toast.error('Nepodporovaný formát souboru. Povoleny jsou pouze obrázky (JPG, PNG, GIF, WEBP, SVG).')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error('Soubor je příliš velký. Maximální velikost je 5 MB.')
    return
  }

  avatarFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const clearAvatar = () => {
  avatarPreview.value = null
  avatarFile.value = null
  memberForm.value.avatar_url = ''
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

const onAvatarDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOverAvatar.value = true
}

const onAvatarDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOverAvatar.value = false
}

const onAvatarDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOverAvatar.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return

  // Povolené mime types včetně SVG
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ]

  if (!allowedMimeTypes.includes(file.type)) {
    toast.error('Prosím, nahrajte obrázek (JPG/PNG/GIF/WEBP/SVG).')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Soubor je příliš velký. Maximální velikost je 5 MB.')
    return
  }
  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => {
    avatarPreview.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

const uploadAvatar = async (memberId: string): Promise<string | null> => {
  if (!avatarFile.value) return null

  try {
    uploadingAvatar.value = true

    // Získání informací o oddílu z localStorage (pokud je přihlášen přes oddíl)
    let departmentData: any = null
    if (process.client) {
      const memberDepartment = localStorage.getItem('memberDepartment')
      if (memberDepartment) {
        try {
          departmentData = JSON.parse(memberDepartment)
        } catch (e) {
          console.error('Error parsing memberDepartment:', e)
        }
      }
    }

    // Vytvoření FormData pro upload
    const formData = new FormData()
    formData.append('avatar', avatarFile.value)
    formData.append('memberId', memberId)
    if (departmentData) {
      formData.append('_departmentData', JSON.stringify(departmentData))
    }

    // Nahrání přes API endpoint
    const response = await $fetch('/api/member-users/upload-avatar', {
      method: 'POST',
      body: formData
    }) as { success: boolean, avatar_url: string }

    if (!response.success || !response.avatar_url) {
      throw new Error('Nepodařilo se nahrát fotografii')
    }

    return response.avatar_url
  } catch (err: any) {
    console.error('Error uploading avatar:', err)
    const errorMsg = err.data?.statusMessage || err.message || 'Nepodařilo se nahrát fotografii'
    toast.error(errorMsg)
    return null
  } finally {
    uploadingAvatar.value = false
  }
}

const handleMemberSubmit = async () => {
  try {
    if (editingMember.value) {
      // Debug: zkontrolujeme, co máme v memberForm
      console.log('Updating member with department_ids:', memberForm.value.department_ids)

      // Update existing member
      const updateData: any = {
        full_name: memberForm.value.full_name,
        department_ids: memberForm.value.department_ids || [],
        email: memberForm.value.email || undefined,
        phone: memberForm.value.phone || undefined,
        street: memberForm.value.street || undefined,
        city: memberForm.value.city || undefined,
        postal_code: memberForm.value.postal_code || undefined,
        full_address: memberForm.value.full_address || undefined,
        birth_date: memberForm.value.birth_date || undefined,
        birth_place: memberForm.value.birth_place || undefined,
        notes: memberForm.value.notes || undefined,
        is_active: memberForm.value.is_active
      }

      console.log('Sending updateData:', updateData)

      // Upload avatar if selected
      if (avatarFile.value) {
        const uploaded = await uploadAvatar(editingMember.value.id)
        if (uploaded) {
          updateData.avatar_url = uploaded
        }
      }

      await updateMember(editingMember.value.id, updateData)

      // Po úspěšném update načteme všechny členy znovu, aby měli aktuální stav včetně oddílů
      // Použijeme fetchMembers, který správně načte všechny oddíly pro každého člena
      console.log('Refreshing members list after update...')
      await fetchMembers()
      console.log('Members list refreshed. Current members:', members.value.map(m => ({
        id: m.id,
        name: m.full_name,
        departments: m.departments
      })))

      toast.success('Člen byl úspěšně aktualizován')
    } else {
      // Create new member
      const newMember = await createMember({
        department_ids: memberForm.value.department_ids,
        full_name: memberForm.value.full_name,
        email: memberForm.value.email || undefined,
        phone: memberForm.value.phone || undefined,
        street: memberForm.value.street || undefined,
        city: memberForm.value.city || undefined,
        postal_code: memberForm.value.postal_code || undefined,
        full_address: memberForm.value.full_address || undefined,
        birth_date: memberForm.value.birth_date || undefined,
        birth_place: memberForm.value.birth_place || undefined,
        notes: memberForm.value.notes || undefined,
        is_active: memberForm.value.is_active
      })

      // Upload avatar if selected
      if (avatarFile.value && newMember) {
        const avatarUrl = await uploadAvatar(newMember.id)
        if (avatarUrl) {
          await updateMember(newMember.id, { avatar_url: avatarUrl } as any)
        }
      }

      toast.success('Člen byl úspěšně přidán')
    }
    closeMemberModal()
    await fetchMembers()
  } catch (err: any) {
    console.error('Chyba při ukládání člena:', err)
    toast.error(err.message || 'Nepodařilo se uložit člena')
  }
}

const openDeleteMemberModal = (member: MemberUser) => {
  memberToDelete.value = member
  showDeleteMemberModal.value = true
}

const handleDeleteMember = async () => {
  if (!memberToDelete.value) return

  try {
    await deleteMember(memberToDelete.value.id)
    toast.success('Člen byl úspěšně smazán')
    showDeleteMemberModal.value = false
    memberToDelete.value = null
    await fetchMembers()
  } catch (err: any) {
    console.error('Chyba při mazání člena:', err)
    toast.error(err.message || 'Nepodařilo se smazat člena')
  }
}

onMounted(async () => {
  // Přidání event listeneru pro zavření tooltipů při kliknutí mimo ně
  if (process.client) {
    document.addEventListener('click', closeTooltipsOnClickOutside)
  }

  try {
    await checkUserRole()
    await loadCurrentDepartment()
    await Promise.all([
      fetchDepartments(),
      fetchMembers(),
      checkManagePermissions()
    ])
  } catch (err: any) {
    console.error('Chyba při načítání dat:', err)
    toast.error('Nepodařilo se načíst data členské sekce')
  }
})

onUnmounted(() => {
  // Odstranění event listeneru při odpojení komponenty
  if (process.client) {
    document.removeEventListener('click', closeTooltipsOnClickOutside)
  }
})
</script>


