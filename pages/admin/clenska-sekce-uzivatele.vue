<template>
  <div class="w-full px-4 py-8 pb-20">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Členská sekce - Správa uživatelů</h1>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'departments'"
            :class="[
              activeTab === 'departments'
                ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            <span class="material-icons-outlined text-[18px] mr-2 align-middle">groups</span>
            Oddíly
          </button>
          <button
            @click="activeTab = 'members'"
            :class="[
              activeTab === 'members'
                ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            <span class="material-icons-outlined text-[18px] mr-2 align-middle">person</span>
            Členové
          </button>
          <button
            @click="activeTab = 'password'"
            :class="[
              activeTab === 'password'
                ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            <span class="material-icons-outlined text-[18px] mr-2 align-middle">key</span>
            Nastavení hesla
          </button>
          <button
            @click="activeTab = 'logs'"
            :class="[
              activeTab === 'logs'
                ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            <span class="material-icons-outlined text-[18px] mr-2 align-middle">history</span>
            Historie přihlášení
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab: Oddíly -->
    <div v-if="activeTab === 'departments'">
      <div class="flex justify-between items-center mb-6">
        <p class="text-gray-600 dark:text-gray-400">Správa oddílů členské sekce</p>
        <button
          v-if="permissions.create"
          @click="openCreateDepartmentModal"
          class="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
        >
          <span class="material-icons-outlined text-[18px] mr-2">add</span>
          Přidat oddíl
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="departmentsLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
      </div>

      <!-- Departments grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="dept in departments"
          :key="dept.id"
          class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ dept.display_name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ dept.name }}</p>
            </div>
            <span
              :class="[
                'px-2 py-1 text-xs font-semibold rounded-full',
                dept.is_active
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
              ]"
            >
              {{ dept.is_active ? 'Aktivní' : 'Neaktivní' }}
            </span>
          </div>

          <p v-if="dept.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ dept.description }}</p>

          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span class="material-icons-outlined text-[18px] mr-1">people</span>
            <span>{{ dept.member_count || 0 }} členů</span>
          </div>

          <div class="flex gap-2">
            <button
              @click="editDepartment(dept)"
              class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <span class="material-icons-outlined text-[18px] mr-1">edit</span>
              Upravit
            </button>
            <button
              @click="changePassword(dept)"
              class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-sm font-medium rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <span class="material-icons-outlined text-[18px] mr-1">lock_reset</span>
              Heslo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Členové -->
    <div v-if="activeTab === 'members'">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <select
            v-model="selectedDepartmentFilter"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-900"
          >
            <option value="">Všechny oddíly</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.display_name }}</option>
          </select>
        </div>
        <div v-if="permissions.create" class="flex gap-2">
          <button
            @click="openCreateMemberModal"
            class="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
          >
            <span class="material-icons-outlined text-[18px] mr-2">person_add</span>
            Přidat člena
          </button>
          <button
            @click="openImportModal"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <span class="material-icons-outlined text-[18px] mr-2">upload</span>
            Importovat členy
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="membersLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
      </div>

      <!-- Members table -->
      <div v-else class="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jméno</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Oddíl</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kontakt</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Akce</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ member.full_name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300">
                    {{ member.department?.display_name }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white">{{ member.email || '—' }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ member.phone || '—' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    @click="toggleMemberStatus(member)"
                    :disabled="membersLoading || !permissions.edit"
                    :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer',
                      'hover:opacity-80 hover:scale-105',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                      member.is_active
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    ]"
                    :title="permissions.edit ? (member.is_active ? 'Klikněte pro deaktivaci' : 'Klikněte pro aktivaci') : 'Nemáte oprávnění měnit status'"
                  >
                    {{ member.is_active ? 'Aktivní' : 'Neaktivní' }}
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="editMember(member)"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                    title="Upravit"
                  >
                    <span class="material-icons-outlined text-[20px]">edit</span>
                  </button>
                  <button
                    @click="deleteMember(member)"
                    class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    title="Smazat"
                  >
                    <span class="material-icons-outlined text-[20px]">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-if="filteredMembers.length === 0" class="text-center py-12 px-4">
          <span class="material-icons-outlined text-4xl text-gray-400 dark:text-gray-600 mb-3">person_off</span>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Žádní členové</h3>
          <p class="text-gray-500 dark:text-gray-400">V tomto oddíle zatím nejsou žádní členové.</p>
        </div>
      </div>
    </div>

    <!-- Tab: Nastavení hesla -->
    <div v-if="activeTab === 'password'">
      <div class="max-w-3xl">
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons-outlined">key</span>
            Společné heslo do členské sekce
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Toto heslo je společné pro všechny oddíly. Členové ho použijí spolu s výběrem oddílu a svým e-mailem.
          </p>

          <form @submit.prevent="handlePasswordUpdate" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Současné heslo *
              </label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                required
                class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-900"
                placeholder="Zadejte současné heslo"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nové heslo *
              </label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                required
                minlength="6"
                class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-900"
                placeholder="Zadejte nové heslo (min. 6 znaků)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Potvrdit nové heslo *
              </label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                minlength="6"
                class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-900"
                placeholder="Potvrďte nové heslo"
              />
            </div>

            <div v-if="passwordError" class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <p class="text-sm text-red-800 dark:text-red-200">{{ passwordError }}</p>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-60 inline-flex items-center gap-2"
                :disabled="passwordLoading"
              >
                <span class="material-icons-outlined text-[18px]">{{ passwordLoading ? 'sync' : 'save' }}</span>
                {{ passwordLoading ? 'Ukládám...' : 'Změnit heslo' }}
              </button>
            </div>
          </form>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div class="flex items-start gap-3">
            <span class="material-icons-outlined text-blue-600 dark:text-blue-400 flex-shrink-0">info</span>
            <div class="space-y-2 text-sm text-blue-900 dark:text-blue-100">
              <p class="font-medium">Důležité informace:</p>
              <ul class="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Toto heslo je společné pro všechny oddíly</li>
                <li>Členové použijí toto heslo společně s výběrem oddílu a svým e-mailem</li>
                <li>Heslo musí mít minimálně 6 znaků</li>
                <li>Doporučujeme použít silné heslo s kombinací písmen, čísel a speciálních znaků</li>
                <li>Změna hesla se zaznamenává do audit logu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Historie přihlášení -->
    <div v-if="activeTab === 'logs'">
      <p class="text-gray-600 dark:text-gray-400 mb-6">Sledování přihlášení členů podle oddílů</p>

      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
        <p class="text-gray-500 dark:text-gray-400">Historie přihlášení bude k dispozici po prvních přihlášeních členů.</p>
      </div>
    </div>

    <!-- Modal: Vytvořit oddíl -->
    <TransitionRoot appear :show="showCreateDepartmentModal" as="template">
      <Dialog as="div" @close="showCreateDepartmentModal = false" class="relative z-50">
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
                <DialogTitle class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {{ editingDepartment ? 'Upravit oddíl' : 'Vytvořit oddíl' }}
                </DialogTitle>

                <form @submit.prevent="handleDepartmentSubmit" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Název (ID) <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="departmentForm.name"
                      type="text"
                      required
                      :disabled="!!editingDepartment"
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                      placeholder="např. alt, bas"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Zobrazovaný název <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="departmentForm.display_name"
                      type="text"
                      required
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="např. Alt, Bas"
                    />
                  </div>

                  <div v-if="!editingDepartment" class="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
                    <div class="flex items-start gap-2">
                      <span class="material-icons-outlined text-blue-600 dark:text-blue-400 text-[18px] flex-shrink-0">info</span>
                      <p class="text-sm text-blue-900 dark:text-blue-100">
                        Nový oddíl bude automaticky používat společné heslo nastavené v sekci "Nastavení hesla".
                      </p>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Popis (volitelný)
                    </label>
                    <textarea
                      v-model="departmentForm.description"
                      rows="3"
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Popis oddílu"
                    />
                  </div>

                  <div v-if="editingDepartment" class="flex items-center">
                    <input
                      v-model="departmentForm.is_active"
                      type="checkbox"
                      id="dept-active"
                      class="rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500"
                    />
                    <label for="dept-active" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Aktivní oddíl
                    </label>
                  </div>

                  <div class="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      @click="closeDepartmentModal"
                      class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700"
                      :disabled="departmentsLoading"
                    >
                      {{ editingDepartment ? 'Uložit' : 'Vytvořit' }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal: Změna hesla oddílu -->
    <TransitionRoot appear :show="showPasswordModal" as="template">
      <Dialog as="div" @close="showPasswordModal = false" class="relative z-50">
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
                <DialogTitle class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Změnit heslo oddílu
                </DialogTitle>

                <form @submit.prevent="handlePasswordChange" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nové heslo <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="newPassword"
                      type="password"
                      required
                      minlength="6"
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Minimálně 6 znaků"
                    />
                  </div>

                  <div class="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      @click="showPasswordModal = false"
                      class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700"
                      :disabled="departmentsLoading"
                    >
                      Změnit heslo
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal: Vytvořit/upravit člena -->
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
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <DialogTitle class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {{ editingMember ? 'Upravit člena' : 'Přidat člena' }}
                </DialogTitle>

                <form @submit.prevent="handleMemberSubmit" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jméno <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="memberForm.full_name"
                      type="text"
                      required
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Jana Nováková"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Oddíl <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="memberForm.department_id"
                      required
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Vyberte oddíl</option>
                      <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                        {{ dept.display_name }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      v-model="memberForm.email"
                      type="email"
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="jana@example.com"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefon
                    </label>
                    <input
                      v-model="memberForm.phone"
                      type="tel"
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="+420 123 456 789"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Poznámky
                    </label>
                    <textarea
                      v-model="memberForm.notes"
                      rows="3"
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Volitelné poznámky"
                    ></textarea>
                  </div>

                  <div class="flex items-center">
                    <input
                      v-model="memberForm.is_active"
                      type="checkbox"
                      id="member-active"
                      class="rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500"
                    />
                    <label for="member-active" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Aktivní člen
                    </label>
                  </div>

                  <div class="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      @click="showMemberModal = false"
                      class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700"
                      :disabled="membersLoading"
                    >
                      {{ editingMember ? 'Uložit' : 'Přidat' }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal: Importovat členy -->
    <TransitionRoot appear :show="showImportModal" as="template">
      <Dialog as="div" @close="showImportModal = false" class="relative z-50">
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
                  Importovat členy z JSONu
                </DialogTitle>

                <form @submit.prevent="handleImportSubmit" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Oddíl <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="importForm.department_id"
                      required
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Vyberte oddíl</option>
                      <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                        {{ dept.display_name }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      JSON data <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      v-model="importForm.jsonData"
                      rows="15"
                      required
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder='[&#10;  {&#10;    "Jmeno": "Jana Nováková",&#10;    "E-mail": "jana@example.com",&#10;    "Telefon": "+420 123 456 789",&#10;    "Ulice": "Hlavní 123",&#10;    "Mesto": "Praha",&#10;    "PSC": "123 45",&#10;    "Cela Adresa": "Hlavní 123, 123 45 Praha",&#10;    "Datum narozeni": "12.07.1999",&#10;    "Mesto narozeni": "Praha"&#10;  }&#10;]'
                    ></textarea>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Formát: pole objektů s českými klíči. Každý objekt musí obsahovat alespoň "Jmeno".
                      Dostupné pole: Jmeno, E-mail, Telefon, Ulice, Mesto, PSC, Cela Adresa, Datum narozeni (formát DD.MM.YYYY), Mesto narozeni
                    </p>
                  </div>

                  <!-- Náhled -->
                  <div v-if="importPreview.length > 0" class="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Náhled ({{ importPreview.length }} členů):
                    </h4>
                    <div class="max-h-40 overflow-y-auto space-y-1">
                      <div
                        v-for="(member, index) in importPreview"
                        :key="index"
                        class="text-xs text-gray-600 dark:text-gray-400"
                      >
                        {{ index + 1 }}. {{ member.full_name }}
                        <span v-if="member.email" class="text-gray-500">({{ member.email }})</span>
                      </div>
                    </div>
                  </div>

                  <!-- Chyba validace -->
                  <div v-if="importError" class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                    <p class="text-sm text-red-800 dark:text-red-200">{{ importError }}</p>
                  </div>

                  <div class="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      @click="closeImportModal"
                      class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Zrušit
                    </button>
                    <button
                      type="button"
                      @click="validateImportData"
                      class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Ověřit JSON
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      :disabled="membersLoading || importPreview.length === 0"
                    >
                      {{ membersLoading ? 'Importuji...' : `Importovat ${importPreview.length || 0} členů` }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { useMemberDepartments, type MemberDepartment } from '~/composables/useMemberDepartments'
import { useMemberManagement, type MemberUser } from '~/composables/useMemberManagement'
import { useToast } from '~/composables/useToast'
import AdminBreadcrumbs from '~/components/AdminBreadcrumbs.vue'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'permission'],
})

const supabase = useSupabaseClient()
const toast = useToast()
const {
  departments,
  loading: departmentsLoading,
  fetchDepartments,
  createDepartment,
  updateDepartment,
  updateDepartmentPassword,
} = useMemberDepartments()

const {
  members,
  loading: membersLoading,
  fetchMembers,
  createMember,
  updateMember: updateMemberData,
  updateMemberStatus,
  deleteMember: deleteMemberData,
  bulkImportMembers,
} = useMemberManagement()

// State
const activeTab = ref<'departments' | 'members' | 'password' | 'logs'>('departments')
const selectedDepartmentFilter = ref('')
const showCreateDepartmentModal = ref(false)
const showPasswordModal = ref(false)
const showMemberModal = ref(false)
const showImportModal = ref(false)
const editingDepartment = ref<MemberDepartment | null>(null)
const editingMember = ref<MemberUser | null>(null)
const newPassword = ref('')

// Password form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordLoading = ref(false)
const passwordError = ref('')

const departmentForm = ref({
  name: '',
  display_name: '',
  description: '',
  is_active: true,
})

const memberForm = ref({
  full_name: '',
  department_id: '',
  email: '',
  phone: '',
  notes: '',
  is_active: true,
})

// Import form
const importForm = ref({
  department_id: '',
  jsonData: '',
})
const importPreview = ref<Array<{ full_name: string; email?: string }>>([])
const importError = ref('')

// Permissions
const permissions = ref({
  view: false,
  create: false,
  edit: false,
  delete: false,
})

// Computed
const filteredMembers = computed(() => {
  if (!selectedDepartmentFilter.value) return members.value
  return members.value.filter(m => m.department_id === selectedDepartmentFilter.value)
})

// Methods
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data?.user?.email) throw new Error('Uživatel není přihlášen')

    const actions = ['view', 'create', 'edit', 'delete']
    const permissionPromises = actions.map((action) =>
      supabase.rpc('check_permission', {
        p_email: user.data.user.email,
        p_section: 'member_management',
        p_action: action,
      })
    )

    const results = await Promise.all(permissionPromises)
    actions.forEach((action, index) => {
      (permissions.value as any)[action] = results[index].data
    })
  } catch (err) {
    console.error('Error loading permissions:', err)
  }
}

// Department methods
const openCreateDepartmentModal = () => {
  editingDepartment.value = null
  departmentForm.value = {
    name: '',
    display_name: '',
    description: '',
    is_active: true,
  }
  showCreateDepartmentModal.value = true
}

const editDepartment = (dept: MemberDepartment) => {
  editingDepartment.value = dept
  departmentForm.value = {
    name: dept.name,
    display_name: dept.display_name,
    description: dept.description || '',
    is_active: dept.is_active,
  }
  showCreateDepartmentModal.value = true
}

const closeDepartmentModal = () => {
  showCreateDepartmentModal.value = false
  editingDepartment.value = null
}

const handleDepartmentSubmit = async () => {
  try {
    if (editingDepartment.value) {
      await updateDepartment(editingDepartment.value.id, {
        display_name: departmentForm.value.display_name,
        description: departmentForm.value.description || undefined,
        is_active: departmentForm.value.is_active,
      })
    } else {
      // Odesíláme pouze pole, která API očekává
      const createData = {
        name: departmentForm.value.name.trim(),
        display_name: departmentForm.value.display_name.trim(),
        description: departmentForm.value.description?.trim() || undefined,
      }
      console.log('Sending create department data:', createData)
      await createDepartment(createData)
    }
    closeDepartmentModal()
  } catch (err) {
    console.error('Error saving department:', err)
  }
}

const changePassword = (dept: MemberDepartment) => {
  editingDepartment.value = dept
  newPassword.value = ''
  showPasswordModal.value = true
}

const handlePasswordChange = async () => {
  if (!editingDepartment.value) return
  try {
    await updateDepartmentPassword(editingDepartment.value.id, newPassword.value)
    showPasswordModal.value = false
    editingDepartment.value = null
  } catch (err) {
    console.error('Error changing password:', err)
  }
}

// Member methods
const openCreateMemberModal = () => {
  editingMember.value = null
  memberForm.value = {
    full_name: '',
    department_id: '',
    email: '',
    phone: '',
    notes: '',
    is_active: true,
  }
  showMemberModal.value = true
}

const editMember = (member: MemberUser) => {
  editingMember.value = member
  memberForm.value = {
    full_name: member.full_name,
    department_id: member.department_id,
    email: member.email || '',
    phone: member.phone || '',
    notes: member.notes || '',
    is_active: member.is_active,
  }
  showMemberModal.value = true
}

const handleMemberSubmit = async () => {
  try {
    if (editingMember.value) {
      await updateMemberData(editingMember.value.id, memberForm.value)
    } else {
      await createMember(memberForm.value)
    }
    showMemberModal.value = false
  } catch (err) {
    console.error('Error saving member:', err)
  }
}

const deleteMember = async (member: MemberUser) => {
  if (!confirm(`Opravdu chcete smazat člena ${member.full_name}?`)) return
  try {
    await deleteMemberData(member.id)
  } catch (err) {
    console.error('Error deleting member:', err)
  }
}

// Rychlá změna statusu člena
const toggleMemberStatus = async (member: MemberUser) => {
  if (!permissions.value.edit) {
    toast.error('Nemáte oprávnění měnit status člena')
    return
  }

  const newStatus = !member.is_active
  const originalStatus = member.is_active

  // Optimistická aktualizace - okamžitě změňme status v UI
  const memberIndex = members.value.findIndex(m => m.id === member.id)
  if (memberIndex !== -1) {
    members.value[memberIndex].is_active = newStatus
  }

  try {
    await updateMemberStatus(member.id, newStatus)
    toast.success(`Člen ${member.full_name} byl ${newStatus ? 'aktivován' : 'deaktivován'}`)
  } catch (err: any) {
    // V případě chyby vrátíme původní status
    if (memberIndex !== -1) {
      members.value[memberIndex].is_active = originalStatus
    }
    console.error('Error toggling member status:', err)
    toast.error(err.data?.statusMessage || err.message || 'Nepodařilo se změnit status člena')
  }
}

// Password management
const handlePasswordUpdate = async () => {
  passwordError.value = ''

  // Validace
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'Nové heslo musí mít alespoň 6 znaků'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Nová hesla se neshodují'
    return
  }

  if (passwordForm.value.currentPassword === passwordForm.value.newPassword) {
    passwordError.value = 'Nové heslo musí být odlišné od současného'
    return
  }

  passwordLoading.value = true

  try {
    const response = await $fetch('/api/member-auth/update-common-password', {
      method: 'POST',
      body: {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      }
    })

    if (response.success) {
      toast.success('Heslo bylo úspěšně změněno')
      // Reset formuláře
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  } catch (err: any) {
    console.error('Chyba při změně hesla:', err)
    passwordError.value = err.data?.statusMessage || 'Nepodařilo se změnit heslo'
  } finally {
    passwordLoading.value = false
  }
}

// Import methods
const openImportModal = () => {
  importForm.value = {
    department_id: '',
    jsonData: '',
  }
  importPreview.value = []
  importError.value = ''
  showImportModal.value = true
}

const closeImportModal = () => {
  showImportModal.value = false
  importForm.value = {
    department_id: '',
    jsonData: '',
  }
  importPreview.value = []
  importError.value = ''
}

const validateImportData = () => {
  importError.value = ''
  importPreview.value = []

  if (!importForm.value.jsonData.trim()) {
    importError.value = 'Prosím vložte JSON data'
    return
  }

  try {
    const parsed = JSON.parse(importForm.value.jsonData)

    if (!Array.isArray(parsed)) {
      importError.value = 'JSON musí být pole objektů'
      return
    }

    if (parsed.length === 0) {
      importError.value = 'Pole nesmí být prázdné'
      return
    }

    // Validace každého objektu
    parsed.forEach((member: any, index: number) => {
      if (!member || typeof member !== 'object') {
        throw new Error(`Položka na pozici ${index + 1} není objekt`)
      }
      const full_name = member.Jmeno || member.full_name || member.jmeno
      if (!full_name || typeof full_name !== 'string' || full_name.trim() === '') {
        throw new Error(`Položka na pozici ${index + 1} nemá vyplněné jméno (Jmeno)`)
      }
    })

    // Vytvoření náhledu
    importPreview.value = parsed.map((m: any) => ({
      full_name: (m.Jmeno || m.full_name || m.jmeno || '').trim(),
      email: (m['E-mail'] || m.email || m['e-mail'] || '').trim() || undefined
    }))

    toast.success(`JSON je platný. Připraveno k importu ${parsed.length} členů.`)
  } catch (err: any) {
    importError.value = err.message || 'Neplatný formát JSON'
    importPreview.value = []
  }
}

const handleImportSubmit = async () => {
  if (!importForm.value.department_id) {
    importError.value = 'Prosím vyberte oddíl'
    return
  }

  if (importPreview.value.length === 0) {
    importError.value = 'Prosím nejdříve ověřte JSON data'
    return
  }

  try {
    // Parsování JSONu znovu pro získání všech dat
    const parsed = JSON.parse(importForm.value.jsonData)

    // Odeslání surových dat - API endpoint provede mapování
    await bulkImportMembers(importForm.value.department_id, parsed)
    closeImportModal()
  } catch (err: any) {
    console.error('Error importing members:', err)
    importError.value = err.data?.statusMessage || err.message || 'Nepodařilo se importovat členy'
  }
}

// Initialize
onMounted(async () => {
  await loadPermissions()
  await fetchDepartments()
  await fetchMembers()
})
</script>

