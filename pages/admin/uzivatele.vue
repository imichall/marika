<template>
  <div class="w-full px-4 py-8 pb-20">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Správa uživatelů</h1>
      <button
        v-if="mainTab === 'admin' && permissions.create"
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
      >
        <span class="material-icons-outlined text-[18px] mr-2">person_add</span>
        Přidat uživatele
      </button>
      <button
        v-if="mainTab === 'members' && memberTab === 'departments' && memberPermissions.create"
        @click="openCreateDepartmentModal"
        class="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
      >
        <span class="material-icons-outlined text-[18px] mr-2">add</span>
        Přidat oddíl
      </button>
      <button
        v-if="mainTab === 'members' && memberTab === 'users' && memberPermissions.create"
        @click="openCreateMemberModal"
        class="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
      >
        <span class="material-icons-outlined text-[18px] mr-2">person_add</span>
        Přidat člena
      </button>
    </div>

    <!-- Main Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="mainTab = 'admin'"
            :class="[
              mainTab === 'admin'
                ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            <span class="material-icons-outlined text-[18px] mr-2 align-middle">admin_panel_settings</span>
            Admin uživatelé
          </button>
          <button
            @click="mainTab = 'members'"
            :class="[
              mainTab === 'members'
                ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            <span class="material-icons-outlined text-[18px] mr-2 align-middle">groups</span>
            Členská sekce
          </button>
        </nav>
      </div>
    </div>

    <!-- Admin Users Tab -->
    <div v-if="mainTab === 'admin'">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"
      ></div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center border border-red-200 dark:border-red-800"
    >
      {{ error }}
    </div>

    <!-- Users table -->
    <div v-else class="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Jméno
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Poslední přihlášení
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Vytvořeno
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mr-3"
                  >
                    {{
                      user.name
                        ? user.name.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()
                    }}
                  </div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ user.name || "—" }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300': user.is_admin,
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300': !user.is_admin,
                    }"
                  >
                    {{ user.is_admin ? "Admin" : "Uživatel" }}
                  </span>
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300': user.role === 'admin',
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300': user.role === 'editor',
                      'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300': user.role === 'viewer',
                    }"
                  >
                    {{ getRoleName(user.role) }}
                  </span>
                  <div
                    v-if="permissions.edit"
                    class="flex items-center space-x-2"
                  >
                    <button
                      @click="editUser(user)"
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      title="Upravit"
                    >
                      <span
                        class="material-icons-outlined text-[20px] leading-none"
                        >edit</span
                      >
                    </button>
                    <button
                      @click="resetPassword(user)"
                      class="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
                      title="Resetovat heslo"
                    >
                      <span
                        class="material-icons-outlined text-[20px] leading-none"
                        >lock_reset</span
                      >
                    </button>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.last_sign_in_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300': user.confirmed_at,
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300': !user.confirmed_at,
                  }"
                >
                  {{ user.confirmed_at ? "Aktivní" : "Nepotvrzený" }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div
        v-if="users.length === 0"
        class="text-center py-12 px-4 bg-white dark:bg-gray-900 rounded-lg"
      >
        <span class="material-icons-outlined text-4xl text-gray-400 dark:text-gray-600 mb-3"
          >person_off</span
        >
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Žádní registrovaní uživatelé
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          V systému zatím nejsou žádní registrovaní uživatelé.
        </p>
      </div>
    </div>
    </div>

    <!-- Members Section Tab -->
    <div v-if="mainTab === 'members'">
      <!-- Sub Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="memberTab = 'departments'"
              :class="[
                memberTab === 'departments'
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
            >
              <span class="material-icons-outlined text-[18px] mr-2 align-middle">groups</span>
              Oddíly
            </button>
            <button
              @click="memberTab = 'users'"
              :class="[
                memberTab === 'users'
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
            >
              <span class="material-icons-outlined text-[18px] mr-2 align-middle">person</span>
              Členové
            </button>
            <button
              @click="memberTab = 'logs'"
              :class="[
                memberTab === 'logs'
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
      <div v-if="memberTab === 'departments'">
        <p class="text-gray-600 dark:text-gray-400 mb-6">Správa oddílů s jejich společnými hesly</p>

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
      <div v-if="memberTab === 'users'">
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
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-semibold rounded-full',
                        member.is_active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                      ]"
                    >
                      {{ member.is_active ? 'Aktivní' : 'Neaktivní' }}
                    </span>
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

      <!-- Tab: Historie přihlášení -->
      <div v-if="memberTab === 'logs'">
        <p class="text-gray-600 dark:text-gray-400 mb-6">Sledování přihlášení členů podle oddílů</p>

        <!-- Loading state -->
        <div v-if="loadingLogs" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
        </div>

        <!-- Logs table -->
        <div v-else-if="loginLogs.length > 0" class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Člen
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Oddíl
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Datum a čas
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IP adresa
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-for="log in loginLogs" :key="log.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <img
                        v-if="log.member_user?.avatar_url"
                        :src="log.member_user.avatar_url"
                        :alt="log.member_user.full_name"
                        class="w-8 h-8 rounded-full object-cover"
                      />
                      <div v-else class="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Icon name="mdi:account" class="text-violet-600 dark:text-violet-400 text-lg" />
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ log.member_user?.full_name || 'Neznámý člen' }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                          {{ log.member_user?.email || '—' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                      {{ log.department?.display_name || log.department?.name || '—' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {{ formatDate(log.login_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {{ log.ip_address }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-12 border border-gray-100 dark:border-gray-800 text-center">
          <Icon name="mdi:history" class="text-5xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400">Historie přihlášení bude k dispozici po prvních přihlášeních členů.</p>
        </div>
      </div>
    </div>

    <!-- Modal pro vytvoření nového uživatele -->
    <TransitionRoot appear :show="showCreateModal" as="template">
      <Dialog as="div" @close="showCreateModal = false" class="relative z-50">
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
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <div class="absolute right-6 top-6">
                  <button
                    @click="showCreateModal = false"
                    class="rounded-full p-2 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <span class="material-icons-outlined">close</span>
                  </button>
                </div>

                <div class="mb-8">
                  <DialogTitle as="h3" class="text-2xl font-bold text-gray-900 dark:text-white">
                    Vytvořit nového uživatele
                  </DialogTitle>
                  <p class="mt-2 text-gray-500 dark:text-gray-400">
                    Vytvořte nový účet a pošlete uživateli potvrzovací e-mail
                  </p>
                </div>

                <form @submit.prevent="handleCreateUser" class="space-y-6">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1"
                    >
                      Jméno (volitelné)
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >person</span
                          >
                        </span>
                      </div>
                      <input
                        v-model="newUser.name"
                        type="text"
                        class="pl-10 block w-full rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-900 focus:ring-opacity-50 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Zadejte jméno uživatele"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1"
                    >
                      Email <span class="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >mail</span
                          >
                        </span>
                      </div>
                      <input
                        v-model="newUser.email"
                        type="email"
                        required
                        class="pl-10 block w-full rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-900 focus:ring-opacity-50 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="email@priklad.cz"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1"
                    >
                      Heslo <span class="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >lock</span
                          >
                        </span>
                      </div>
                      <input
                        v-model="newUser.password"
                        type="password"
                        required
                        minlength="6"
                        class="pl-10 block w-full rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-900 focus:ring-opacity-50 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Minimálně 6 znaků"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1"
                    >
                      Role <span class="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >badge</span
                          >
                        </span>
                      </div>
                      <select
                        v-model="newUser.role"
                        required
                        class="pl-10 block w-full rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-violet-500 dark:focus:border-violet-400 focus:ring focus:ring-violet-200 dark:focus:ring-violet-900 focus:ring-opacity-50 transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-500 appearance-none cursor-pointer text-gray-900 dark:text-white"
                      >
                        <option value="viewer" class="py-2">Prohlížeč</option>
                        <option value="editor" class="py-2">Editor</option>
                        <option value="admin" class="py-2">Administrátor</option>
                      </select>
                      <div
                        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                      >
                        <span
                          class="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >expand_more</span
                          >
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-if="createError" class="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md text-sm border border-red-200 dark:border-red-800">
                    {{ createError }}
                  </div>

                  <div class="flex justify-end gap-3 pt-6">
                    <button
                      type="button"
                      @click="closeCreateModal"
                      class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 dark:focus:ring-violet-400 transition-all duration-200"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-xl hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200 min-w-[100px]"
                      :disabled="creatingUser"
                    >
                      <span
                        v-if="creatingUser"
                        class="inline-block animate-spin mr-2"
                      >
                        <span class="material-icons-outlined text-[20px]"
                          >refresh</span
                        >
                      </span>
                      <span v-else>Vytvořit</span>
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal pro úpravu uživatele -->
    <TransitionRoot appear :show="showEditModal" as="template">
      <Dialog as="div" @close="showEditModal = false" class="relative z-50">
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
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <div class="absolute right-6 top-6">
                  <button
                    @click="showEditModal = false"
                    class="rounded-full p-2 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <span class="material-icons-outlined">close</span>
                  </button>
                </div>

                <div class="mb-8">
                  <DialogTitle as="h3" class="text-2xl font-bold text-gray-900 dark:text-white">
                    Upravit uživatele
                  </DialogTitle>
                  <p class="mt-2 text-gray-500 dark:text-gray-400">
                    Upravte roli existujícího uživatele
                  </p>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-6">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-2 ml-1"
                    >
                      Jméno
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 group-hover:text-violet-500 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >person</span
                          >
                        </span>
                      </div>
                      <input
                        v-if="editingUser"
                        v-model="editingUser.name"
                        type="text"
                        class="pl-10 block w-full rounded-xl border-gray-200 bg-white shadow-sm focus:border-violet-500 focus:ring focus:ring-violet-200 focus:ring-opacity-50 transition-all duration-200 hover:border-violet-300"
                        placeholder="Zadejte jméno uživatele"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-2 ml-1"
                    >
                      Email
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 group-hover:text-violet-500 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >mail</span
                          >
                        </span>
                      </div>
                      <input
                        v-if="editingUser"
                        v-model="editingUser.email"
                        type="email"
                        disabled
                        class="pl-10 block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-2 ml-1"
                    >
                      Role
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <span
                          class="text-gray-400 group-hover:text-violet-500 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >badge</span
                          >
                        </span>
                      </div>
                      <select
                        v-if="editingUser"
                        v-model="editingUser.role"
                        required
                        class="pl-10 block w-full rounded-xl border-gray-200 bg-white shadow-sm focus:border-violet-500 focus:ring focus:ring-violet-200 focus:ring-opacity-50 transition-all duration-200 hover:border-violet-300 appearance-none cursor-pointer"
                      >
                        <option value="admin" class="py-2">
                          Administrátor
                        </option>
                        <option value="editor" class="py-2">Editor</option>
                        <option value="viewer" class="py-2">Prohlížeč</option>
                      </select>
                      <div
                        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                      >
                        <span
                          class="text-gray-400 group-hover:text-violet-500 transition-colors duration-200"
                        >
                          <span class="material-icons-outlined text-[20px]"
                            >expand_more</span
                          >
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-end gap-3 pt-6">
                    <button
                      type="button"
                      @click="showEditModal = false"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-xl hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200 min-w-[100px]"
                      :disabled="loading"
                    >
                      <span
                        v-if="loading"
                        class="inline-block animate-spin mr-2"
                      >
                        <span class="material-icons-outlined text-[20px]"
                          >refresh</span
                        >
                      </span>
                      Uložit
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal: Vytvořit/upravit oddíl -->
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
              <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <DialogTitle class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {{ editingDepartment ? 'Upravit oddíl' : 'Vytvořit oddíl' }}
                </DialogTitle>

                <form @submit.prevent="handleDepartmentSubmit" class="space-y-6">
                  <!-- Základní informace -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span class="flex items-center">
                          <span class="material-icons-outlined text-[18px] mr-2 text-violet-600 dark:text-violet-400">tag</span>
                          Název (ID) <span class="text-red-500 ml-1">*</span>
                        </span>
                      </label>
                      <input
                        v-model="departmentForm.name"
                        type="text"
                        required
                        :disabled="!!editingDepartment"
                        class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        placeholder="např. alt, bas, vedeni"
                      />
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                        Použije se pro přihlašování, nelze změnit
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span class="flex items-center">
                          <span class="material-icons-outlined text-[18px] mr-2 text-violet-600 dark:text-violet-400">label</span>
                          Zobrazovaný název <span class="text-red-500 ml-1">*</span>
                        </span>
                      </label>
                      <input
                        v-model="departmentForm.display_name"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
                        placeholder="např. Alt, Bas, Vedení"
                      />
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                        Zobrazí se v rozhraní
                      </p>
                    </div>
                  </div>

                  <div v-if="!editingDepartment">
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span class="flex items-center">
                        <span class="material-icons-outlined text-[18px] mr-2 text-violet-600 dark:text-violet-400">lock</span>
                        Heslo oddílu <span class="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      v-model="departmentForm.password"
                      type="password"
                      required
                      minlength="6"
                      class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
                      placeholder="Minimálně 6 znaků"
                    />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      Sdílené heslo pro všechny členy oddílu
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span class="flex items-center">
                        <span class="material-icons-outlined text-[18px] mr-2 text-violet-600 dark:text-violet-400">description</span>
                        Popis (volitelný)
                      </span>
                    </label>
                    <textarea
                      v-model="departmentForm.description"
                      rows="3"
                      class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all resize-none"
                      placeholder="Popis oddílu, např. 'Altový hlasový oddíl sboru'"
                    />
                  </div>

                  <!-- Oprávnění v členské sekci -->
                  <div class="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                    <h4 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <span class="material-icons-outlined text-[20px] mr-2 text-violet-600 dark:text-violet-400">security</span>
                      Oprávnění v členské sekci
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Nastavte, co mohou členové tohoto oddílu v členské sekci dělat
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="departmentForm.permissions.repertoire_view"
                          type="checkbox"
                          id="perm-repertoire-view"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-repertoire-view" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <span class="material-icons-outlined text-[18px] mr-2 text-gray-500">music_note</span>
                            Zobrazit repertoár
                          </span>
                        </label>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="departmentForm.permissions.repertoire_edit"
                          type="checkbox"
                          id="perm-repertoire-edit"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-repertoire-edit" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <span class="material-icons-outlined text-[18px] mr-2 text-gray-500">edit_note</span>
                            Upravovat repertoár
                          </span>
                        </label>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="departmentForm.permissions.member_directory_view"
                          type="checkbox"
                          id="perm-members-view"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-members-view" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <span class="material-icons-outlined text-[18px] mr-2 text-gray-500">contacts</span>
                            Seznam členů
                          </span>
                        </label>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="departmentForm.permissions.members_area_view"
                          type="checkbox"
                          id="perm-area-view"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-area-view" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <span class="material-icons-outlined text-[18px] mr-2 text-gray-500">login</span>
                            Přístup do sekce
                          </span>
                        </label>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="departmentForm.permissions.member_resources_view"
                          type="checkbox"
                          id="perm-resources-view"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-resources-view" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <span class="material-icons-outlined text-[18px] mr-2 text-gray-500">folder</span>
                            Zobrazit dokumenty
                          </span>
                        </label>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          v-model="departmentForm.permissions.member_resources_upload"
                          type="checkbox"
                          id="perm-resources-upload"
                          class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                        <label for="perm-resources-upload" class="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          <span class="flex items-center">
                            <span class="material-icons-outlined text-[18px] mr-2 text-gray-500">upload</span>
                            Nahrávat dokumenty
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- Status -->
                  <div v-if="editingDepartment" class="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                    <input
                      v-model="departmentForm.is_active"
                      type="checkbox"
                      id="dept-active"
                      class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                    />
                    <label for="dept-active" class="ml-3 flex items-center cursor-pointer">
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">
                        Aktivní oddíl
                      </span>
                      <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        (členové se mohou přihlásit)
                      </span>
                    </label>
                  </div>

                  <div class="flex justify-end gap-3 pt-6 border-t-2 border-gray-200 dark:border-gray-700 mt-6">
                    <button
                      type="button"
                      @click="closeDepartmentModal"
                      class="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:ring-4 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="departmentsLoading"
                    >
                      <span v-if="departmentsLoading" class="material-icons-outlined text-[18px] mr-2 animate-spin">refresh</span>
                      <span v-else class="material-icons-outlined text-[18px] mr-2">{{ editingDepartment ? 'save' : 'add' }}</span>
                      {{ editingDepartment ? 'Uložit změny' : 'Vytvořit oddíl' }}
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
              <DialogPanel class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <span class="material-icons-outlined text-orange-600 dark:text-orange-400 text-3xl">lock_reset</span>
                </div>

                <DialogTitle class="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  Změnit heslo oddílu
                </DialogTitle>
                <p class="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                  Nastavte nové sdílené heslo pro oddíl <strong class="text-gray-900 dark:text-white">{{ editingDepartment?.display_name }}</strong>
                </p>

                <form @submit.prevent="handlePasswordChange" class="space-y-6">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span class="flex items-center">
                        <span class="material-icons-outlined text-[18px] mr-2 text-violet-600 dark:text-violet-400">password</span>
                        Nové heslo <span class="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      v-model="newPassword"
                      type="password"
                      required
                      minlength="6"
                      class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
                      placeholder="Minimálně 6 znaků"
                    />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      ⚠️ Všichni členové oddílu budou muset použít nové heslo
                    </p>
                  </div>

                  <div class="flex gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      @click="showPasswordModal = false"
                      class="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="flex-1 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="departmentsLoading"
                    >
                      <span v-if="departmentsLoading" class="material-icons-outlined text-[18px] mr-2 animate-spin">refresh</span>
                      <span v-else class="material-icons-outlined text-[18px] mr-2">lock_reset</span>
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
              <DialogPanel class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <DialogTitle class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {{ editingMember ? 'Upravit člena' : 'Přidat člena' }}
                </DialogTitle>

                <form @submit.prevent="handleMemberSubmit" class="space-y-6">
                  <!-- Avatar Upload -->
                  <div class="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-6 rounded-xl border-2 border-violet-100 dark:border-gray-700">
                    <label class="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-4">
                      <span class="material-icons-outlined text-[20px] mr-2 text-violet-600 dark:text-violet-400">photo_camera</span>
                      Profilová fotografie (volitelná)
                    </label>
                    <div class="flex items-center gap-6">
                      <div class="relative">
                        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                          <img v-if="avatarPreview || memberForm.avatar_url" :src="avatarPreview || memberForm.avatar_url" class="w-full h-full object-cover" />
                          <span v-else class="material-icons-outlined text-5xl text-violet-300 dark:text-gray-500">person</span>
                        </div>
                        <div v-if="avatarPreview || memberForm.avatar_url" class="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                          <span class="material-icons-outlined text-white text-[16px]">check</span>
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
                            class="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-violet-700 dark:text-violet-300 bg-white dark:bg-gray-700 border-2 border-violet-300 dark:border-violet-700 rounded-lg hover:bg-violet-50 dark:hover:bg-gray-600 transition-all"
                          >
                            <span class="material-icons-outlined text-[18px] mr-2">upload</span>
                            {{ (avatarPreview || memberForm.avatar_url) ? 'Změnit fotku' : 'Nahrát fotku' }}
                          </button>
                          <button
                            v-if="avatarPreview || memberForm.avatar_url"
                            type="button"
                            @click="clearAvatar"
                            class="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 border-2 border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-gray-600 transition-all"
                          >
                            <span class="material-icons-outlined text-[18px] mr-2">delete</span>
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
                          <span class="material-icons-outlined text-[18px] mr-2 text-violet-600 dark:text-violet-400">person</span>
                          Jméno a příjmení <span class="text-red-500 ml-1">*</span>
                        </span>
                      </label>
                      <input
                        v-model="memberForm.full_name"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
                        placeholder="Jana Nováková"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span class="flex items-center">
                          <span class="material-icons-outlined text-[18px] mr-2 text-violet-600 dark:text-violet-400">groups</span>
                          Oddíl <span class="text-red-500 ml-1">*</span>
                        </span>
                      </label>
                      <select
                        v-model="memberForm.department_id"
                        required
                        class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
                      >
                        <option value="">Vyberte oddíl</option>
                        <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                          {{ dept.display_name }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span class="flex items-center">
                          <span class="material-icons-outlined text-[18px] mr-2 text-violet-600 dark:text-violet-400">cake</span>
                          Datum narození
                        </span>
                      </label>
                      <input
                        v-model="memberForm.birth_date"
                        type="date"
                        class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span class="flex items-center">
                          <span class="material-icons-outlined text-[18px] mr-2 text-violet-600 dark:text-violet-400">place</span>
                          Místo narození
                        </span>
                      </label>
                      <input
                        v-model="memberForm.birth_place"
                        type="text"
                        class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
                        placeholder="Praha"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span class="flex items-center">
                          <span class="material-icons-outlined text-[18px] mr-2 text-violet-600 dark:text-violet-400">email</span>
                          Email
                        </span>
                      </label>
                      <input
                        v-model="memberForm.email"
                        type="email"
                        class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
                        placeholder="jana@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span class="flex items-center">
                        <span class="material-icons-outlined text-[18px] mr-2 text-violet-600 dark:text-violet-400">phone</span>
                        Telefon
                      </span>
                    </label>
                    <input
                      v-model="memberForm.phone"
                      type="tel"
                      class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
                      placeholder="+420 123 456 789"
                    />
                  </div>

                  <!-- Adresa -->
                  <div class="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                    <h4 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <span class="material-icons-outlined text-[20px] mr-2 text-violet-600 dark:text-violet-400">home</span>
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
                          class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
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
                          class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
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
                          class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
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
                          class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-400 focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all"
                          placeholder="Bezručova 337, 252 63 Roztoky"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Poznámky -->
                  <div class="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span class="flex items-center">
                        <span class="material-icons-outlined text-[18px] mr-2 text-violet-600 dark:text-violet-400">notes</span>
                        Poznámky
                      </span>
                    </label>
                    <textarea
                      v-model="memberForm.notes"
                      rows="3"
                      class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all resize-none"
                      placeholder="Volitelné poznámky o členovi..."
                    />
                  </div>

                  <!-- Status -->
                  <div class="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                    <input
                      v-model="memberForm.is_active"
                      type="checkbox"
                      id="member-active"
                      class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-2 focus:ring-violet-500 transition-all"
                    />
                    <label for="member-active" class="ml-3 flex items-center cursor-pointer">
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">
                        Aktivní člen
                      </span>
                      <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        (může se přihlašovat do členské sekce)
                      </span>
                    </label>
                  </div>

                  <div class="flex justify-end gap-3 pt-6 border-t-2 border-gray-200 dark:border-gray-700 mt-6">
                    <button
                      type="button"
                      @click="showMemberModal = false"
                      class="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      class="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:ring-4 focus:ring-violet-200 dark:focus:ring-violet-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="membersLoading || uploadingAvatar"
                    >
                      <span v-if="membersLoading || uploadingAvatar" class="material-icons-outlined text-[18px] mr-2 animate-spin">refresh</span>
                      <span v-else class="material-icons-outlined text-[18px] mr-2">{{ editingMember ? 'save' : 'add' }}</span>
                      {{ editingMember ? 'Uložit změny' : 'Přidat člena' }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal: Potvrzení smazání člena -->
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
                  <span class="material-icons-outlined text-red-600 dark:text-red-400 text-2xl">warning</span>
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
                    @click="showDeleteModal = false"
                    class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Zrušit
                  </button>
                  <button
                    type="button"
                    @click="confirmDeleteMember"
                    class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    :disabled="membersLoading"
                  >
                    {{ membersLoading ? 'Mazání...' : 'Smazat' }}
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
definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
});

import { ref, computed, onMounted } from "vue";
import { useSupabaseClient } from "#imports";
import { useToast } from "~/composables/useToast";
import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { useUsers } from "~/composables/useUsers";
import { useMemberDepartments, type MemberDepartment } from '~/composables/useMemberDepartments'
import { useMemberManagement, type MemberUser } from '~/composables/useMemberManagement'

const supabase = useSupabaseClient();
const toast = useToast();

const { users, loading, error, updateUser } = useUsers();

// Member section composables
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
  deleteMember: deleteMemberData,
} = useMemberManagement()

// Tab state
const mainTab = ref<'admin' | 'members'>('admin')
const memberTab = ref<'departments' | 'users' | 'logs'>('departments')

const showEditModal = ref(false);
const showCreateModal = ref(false);
const creatingUser = ref(false);
const createError = ref<string | null>(null);
const editingUser = ref<{
  id: string;
  email: string;
  role: string;
  name?: string;
} | null>(null);
const newUser = ref({
  email: '',
  password: '',
  role: 'viewer' as 'admin' | 'editor' | 'viewer',
  name: ''
});

// Stav oprávnění
const permissions = ref({
  view: false,
  create: false,
  edit: false,
  delete: false,
});

// Members section state
const memberPermissions = ref({
  view: false,
  create: false,
  edit: false,
  delete: false,
})

const selectedDepartmentFilter = ref('')
const showCreateDepartmentModal = ref(false)
const showPasswordModal = ref(false)
const showMemberModal = ref(false)
const editingDepartment = ref<MemberDepartment | null>(null)
const editingMember = ref<MemberUser | null>(null)
const newPassword = ref('')

// Login logs
const loginLogs = ref<any[]>([])
const loadingLogs = ref(false)

const departmentForm = ref({
  name: '',
  display_name: '',
  password: '',
  description: '',
  is_active: true,
  permissions: {
    repertoire_view: true,
    repertoire_edit: false,
    member_directory_view: true,
    members_area_view: true,
    member_resources_view: true,
    member_resources_upload: false
  }
})

const memberForm = ref({
  full_name: '',
  department_id: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  postal_code: '',
  full_address: '',
  birth_date: '',
  birth_place: '',
  notes: '',
  is_active: true,
  avatar_url: '',
})

const avatarInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const uploadingAvatar = ref(false)

// Delete confirmation state
const showDeleteModal = ref(false)
const memberToDelete = ref<MemberUser | null>(null)

// Computed
const filteredMembers = computed(() => {
  if (!selectedDepartmentFilter.value) return members.value
  return members.value.filter(m => m.department_id === selectedDepartmentFilter.value)
})

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) {
      throw new Error("Uživatel není přihlášen");
    }

    // Kontrola oprávnění pro každou akci - admin users
    const actions = ["view", "create", "edit", "delete"];
    const permissionPromises = actions.map((action) =>
      supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "users",
        p_action: action,
      })
    );

    const results = await Promise.all(permissionPromises);

    actions.forEach((action, index) => {
      (permissions.value as any)[action] = results[index].data;
    });

    // Kontrola oprávnění pro členskou sekci
    const memberPermissionPromises = actions.map((action) =>
      supabase.rpc("check_permission", {
        p_email: user.data.user.email,
        p_section: "member_management",
        p_action: action,
      })
    );

    const memberResults = await Promise.all(memberPermissionPromises);

    actions.forEach((action, index) => {
      (memberPermissions.value as any)[action] = memberResults[index].data;
    });
  } catch (err) {
    console.error("Error loading permissions:", err);
    throw new Error("Nepodařilo se načíst oprávnění");
  }
};

// Načtení uživatelů
const fetchUsers = async () => {
  try {
    loading.value = true;
    error.value = null;

    const { data, error: fetchError } = await supabase.rpc("get_users");

    if (fetchError) throw fetchError;

    users.value = data;
  } catch (err) {
    console.error("Error fetching users:", err);
    error.value = "Nepodařilo se načíst seznam uživatelů";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Formátování data
const formatDate = (date: string | null) => {
  if (!date) return "Nikdy";
  return new Date(date).toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Překlad rolí do češtiny
const getRoleName = (role: string) => {
  switch (role) {
    case "admin":
      return "Administrátor";
    case "editor":
      return "Editor";
    case "viewer":
      return "Prohlížeč";
    default:
      return role;
  }
};

// Funkce pro editaci uživatele
const editUser = (user: { id: string; email: string; role: string }) => {
  editingUser.value = { ...user };
  showEditModal.value = true;
};

// Funkce pro uložení úprav uživatele
const handleSubmit = async () => {
  try {
    if (!editingUser.value) return;

    await updateUser(editingUser.value.id, {
      role: editingUser.value.role as "admin" | "editor" | "viewer",
      name: editingUser.value.name,
    });

    // Aktualizujeme data v tabulce bez překreslení modalu
    const { data, error: fetchError } = await supabase.rpc("get_users");
    if (fetchError) throw fetchError;
    users.value = data;

    toast.success("Uživatel byl úspěšně upraven");
    editingUser.value = null; // Nejdřív vyčistíme data
    showEditModal.value = false; // Pak teprve zavřeme modal
  } catch (err) {
    console.error("Error updating user:", err);
    toast.error("Nepodařilo se upravit uživatele");
  }
};

// Funkce pro otevření modalu pro vytvoření uživatele
const openCreateModal = () => {
  newUser.value = {
    email: '',
    password: '',
    role: 'viewer',
    name: ''
  };
  createError.value = null;
  showCreateModal.value = true;
};

// Funkce pro zavření modalu pro vytvoření uživatele
const closeCreateModal = () => {
  showCreateModal.value = false;
  newUser.value = {
    email: '',
    password: '',
    role: 'viewer',
    name: ''
  };
  createError.value = null;
};

// Funkce pro vytvoření nového uživatele
const handleCreateUser = async () => {
  if (!newUser.value.email || !newUser.value.password) {
    createError.value = 'Email a heslo jsou povinné';
    return;
  }

  if (newUser.value.password.length < 6) {
    createError.value = 'Heslo musí mít alespoň 6 znaků';
    return;
  }

  creatingUser.value = true;
  createError.value = null;

  try {
    const response = await $fetch('/api/users/create', {
      method: 'POST',
      body: {
        email: newUser.value.email,
        password: newUser.value.password,
        role: newUser.value.role,
        name: newUser.value.name || undefined
      }
    });

    toast.success(response.message || 'Uživatel byl úspěšně vytvořen a potvrzovací e-mail byl odeslán');

    // Načteme aktualizovaný seznam uživatelů
    await fetchUsers();

    // Zavřeme modal
    closeCreateModal();
  } catch (err: any) {
    console.error('Error creating user:', err);
    const errorMessage = err.data?.message || 'Nepodařilo se vytvořit uživatele';
    createError.value = errorMessage;
    toast.error(errorMessage);
  } finally {
    creatingUser.value = false;
  }
};

// Funkce pro reset hesla
const resetPassword = async (user: { email: string }) => {
  try {
    await $fetch('/api/users/reset-password', {
      method: 'POST',
      body: { userEmail: user.email }
    });

    toast.success(`Email pro reset hesla byl odeslán na ${user.email}`);
  } catch (err: any) {
    console.error("Error resetting password:", err);
    toast.error(err.data?.message || "Nepodařilo se odeslat email pro reset hesla");
  }
};

// Department methods
const openCreateDepartmentModal = () => {
  editingDepartment.value = null
  departmentForm.value = {
    name: '',
    display_name: '',
    password: '',
    description: '',
    is_active: true,
    permissions: {
      repertoire_view: true,
      repertoire_edit: false,
      member_directory_view: true,
      members_area_view: true,
      member_resources_view: true,
      member_resources_upload: false
    }
  }
  showCreateDepartmentModal.value = true
}

const editDepartment = (dept: MemberDepartment) => {
  editingDepartment.value = dept
  departmentForm.value = {
    name: dept.name,
    display_name: dept.display_name,
    password: '',
    description: dept.description || '',
    is_active: dept.is_active,
    permissions: dept.permissions || {
      repertoire_view: true,
      repertoire_edit: false,
      member_directory_view: true,
      members_area_view: true,
      member_resources_view: true,
      member_resources_upload: false
    }
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
        permissions: departmentForm.value.permissions
      })
    } else {
      await createDepartment(departmentForm.value)
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

// Avatar methods
const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

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

const uploadAvatar = async (memberId: string): Promise<string | null> => {
  if (!avatarFile.value) return null

  try {
    uploadingAvatar.value = true

    const fileExt = avatarFile.value.name.split('.').pop()
    const fileName = `${memberId}-${Date.now()}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('member-avatars')
      .upload(filePath, avatarFile.value, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('member-avatars')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (err: any) {
    console.error('Error uploading avatar:', err)
    toast.error('Nepodařilo se nahrát avatar')
    return null
  } finally {
    uploadingAvatar.value = false
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
    street: '',
    city: '',
    postal_code: '',
    full_address: '',
    birth_date: '',
    birth_place: '',
    notes: '',
    is_active: true,
    avatar_url: '',
  }
  clearAvatar()
  showMemberModal.value = true
}

const editMember = (member: MemberUser) => {
  editingMember.value = member
  memberForm.value = {
    full_name: member.full_name,
    department_id: member.department_id,
    email: member.email || '',
    phone: member.phone || '',
    street: member.street || '',
    city: member.city || '',
    postal_code: member.postal_code || '',
    full_address: member.full_address || '',
    birth_date: member.birth_date || '',
    birth_place: member.birth_place || '',
    notes: member.notes || '',
    is_active: member.is_active,
    avatar_url: member.avatar_url || '',
  }
  // Set avatar preview to existing avatar if available
  avatarPreview.value = member.avatar_url || null
  avatarFile.value = null
  showMemberModal.value = true
}

const handleMemberSubmit = async () => {
  try {
    if (editingMember.value) {
      // Update existing member
      const updateData: any = {
        full_name: memberForm.value.full_name,
        email: memberForm.value.email,
        phone: memberForm.value.phone,
        street: memberForm.value.street,
        city: memberForm.value.city,
        postal_code: memberForm.value.postal_code,
        full_address: memberForm.value.full_address,
        birth_date: memberForm.value.birth_date || null,
        birth_place: memberForm.value.birth_place,
        notes: memberForm.value.notes,
        department_id: memberForm.value.department_id,
        is_active: memberForm.value.is_active
      }

      // Upload new avatar if selected
      if (avatarFile.value) {
        const uploaded = await uploadAvatar(editingMember.value.id)
        if (uploaded) {
          updateData.avatar_url = uploaded
        }
      }

      await updateMemberData(editingMember.value.id, updateData)
    } else {
      // Create new member first
      const newMember = await createMember(memberForm.value)

      // Then upload avatar if selected
      if (avatarFile.value && newMember) {
        const avatarUrl = await uploadAvatar(newMember.id)
        if (avatarUrl) {
          await updateMemberData(newMember.id, { avatar_url: avatarUrl } as any)
        }
      }
    }
    showMemberModal.value = false
    clearAvatar()
  } catch (err) {
    console.error('Error saving member:', err)
  }
}

const deleteMember = (member: MemberUser) => {
  memberToDelete.value = member
  showDeleteModal.value = true
}

const confirmDeleteMember = async () => {
  if (!memberToDelete.value) return
  try {
    await deleteMemberData(memberToDelete.value.id)
    showDeleteModal.value = false
    memberToDelete.value = null
  } catch (err) {
    console.error('Error deleting member:', err)
  }
}

// Funkce pro načtení historie přihlášení
const fetchLoginLogs = async () => {
  try {
    loadingLogs.value = true

    const { data, error: logsError } = await supabase
      .from('member_login_logs')
      .select(`
        *,
        member_user:member_users(full_name, email, avatar_url),
        department:member_departments(name, display_name)
      `)
      .order('login_at', { ascending: false })
      .limit(50)

    if (logsError) throw logsError

    loginLogs.value = data || []
  } catch (err: any) {
    console.error('Error fetching login logs:', err)
    toast.error('Nepodařilo se načíst historii přihlášení')
  } finally {
    loadingLogs.value = false
  }
}

onMounted(async () => {
  try {
    loading.value = true;
    await loadPermissions();
    await fetchUsers();

    // Load member section data
    await fetchDepartments()
    await fetchMembers()
    await fetchLoginLogs()
  } catch (err) {
    console.error("Error initializing page:", err);
    error.value = "Nepodařilo se načíst data";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
});
</script>