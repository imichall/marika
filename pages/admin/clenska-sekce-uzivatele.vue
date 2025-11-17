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
        <p class="text-gray-600 dark:text-gray-400">Správa oddílů s jejich společnými hesly</p>
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
        <button
          v-if="permissions.create"
          @click="openCreateMemberModal"
          class="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
        >
          <span class="material-icons-outlined text-[18px] mr-2">person_add</span>
          Přidat člena
        </button>
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

                  <div v-if="!editingDepartment">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Heslo <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="departmentForm.password"
                      type="password"
                      required
                      minlength="6"
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Minimálně 6 znaků"
                    />
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
  deleteMember: deleteMemberData,
} = useMemberManagement()

// State
const activeTab = ref<'departments' | 'members' | 'logs'>('departments')
const selectedDepartmentFilter = ref('')
const showCreateDepartmentModal = ref(false)
const showPasswordModal = ref(false)
const showMemberModal = ref(false)
const editingDepartment = ref<MemberDepartment | null>(null)
const editingMember = ref<MemberUser | null>(null)
const newPassword = ref('')

const departmentForm = ref({
  name: '',
  display_name: '',
  password: '',
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
    password: '',
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
    password: '',
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

// Initialize
onMounted(async () => {
  await loadPermissions()
  await fetchDepartments()
  await fetchMembers()
})
</script>

