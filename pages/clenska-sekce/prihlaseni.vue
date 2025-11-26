<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6">
      <div class="text-center space-y-2">
        <Icon name="mdi:account-music" class="text-5xl text-red-600 mx-auto" />
        <h1 class="text-3xl font-semibold text-slate-900">Členská sekce</h1>
        <p class="text-slate-600 text-sm">
          Přihlaste se pomocé e-mailu nebo hesla k vašemu MAKS
        </p>
      </div>

      <!-- Tabs pro výběr typu přihlášení -->
      <div class="flex border-b border-slate-200">
        <button
          @click="loginType = 'email'"
          :class="[
            'flex-1 py-2 text-sm font-medium transition-colors',
            loginType === 'email'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-700'
          ]"
        >
          Admin
        </button>
        <button
          @click="loginType = 'department'"
          :class="[
            'flex-1 py-2 text-sm font-medium transition-colors',
            loginType === 'department'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-slate-500 hover:text-slate-700'
          ]"
        >
          MAKS
        </button>
      </div>

      <!-- Email přihlášení -->
      <form v-if="loginType === 'email'" class="space-y-4" @submit.prevent="handleEmailLogin">
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-slate-700">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            placeholder="např. jana.novakova@example.com"
          />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-slate-700">Heslo</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="Zadejte heslo"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabindex="-1"
            >
              <Icon :name="showPassword ? 'mdi:eye-off' : 'mdi:eye'" class="text-xl" />
            </button>
          </div>
        </div>

        <p v-if="error" class="text-sm text-red-600">
          {{ error }}
        </p>

        <button
          type="submit"
          class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
          :disabled="loading"
        >
          <Icon name="mdi:login" class="text-lg" />
          {{ loading ? 'Přihlašuji...' : 'Přihlásit se' }}
        </button>
      </form>

      <!-- Oddíl přihlášení -->
      <form v-else class="space-y-4" @submit.prevent="handleDepartmentLogin">
        <div class="space-y-2">
          <label for="member-email" class="text-sm font-medium text-slate-700">Váš e-mail</label>
          <input
            id="member-email"
            v-model="memberEmail"
            type="email"
            required
            autocomplete="email"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            placeholder="např. jana.novakova@example.com"
          />
        </div>

        <div class="space-y-2">
          <label for="dept-password" class="text-sm font-medium text-slate-700">Heslo</label>
          <div class="relative">
            <input
              id="dept-password"
              v-model="departmentPassword"
              :type="showDepartmentPassword ? 'text' : 'password'"
              required
              class="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="Zadejte heslo"
            />
            <button
              type="button"
              @click="showDepartmentPassword = !showDepartmentPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabindex="-1"
            >
              <Icon :name="showDepartmentPassword ? 'mdi:eye-off' : 'mdi:eye'" class="text-xl" />
            </button>
          </div>
        </div>

        <p v-if="error" class="text-sm text-red-600">
          {{ error }}
        </p>

        <button
          type="submit"
          class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
          :disabled="loading"
        >
          <Icon name="mdi:login" class="text-lg" />
          {{ loading ? 'Přihlašuji...' : 'Přihlásit se' }}
        </button>
      </form>

      <div class="text-center text-sm text-slate-500">
        Potřebujete pomoc? Napište na
        <a href="mailto:info@marikasingers.cz" class="font-medium text-red-600 hover:underline">info@marikasingers.cz</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const { login, user, checkUser } = useAuth()
const toast = useToast()

const loginType = ref<'email' | 'department'>('department')
const email = ref('')
const password = ref('')
const memberEmail = ref('')
const departmentPassword = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showDepartmentPassword = ref(false)

const redirectTo = (path?: string | null) => {
  const target = typeof path === 'string' && path.startsWith('/clenska-sekce') ? path : '/clenska-sekce'
  router.push(target)
}

const handleEmailLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const success = await login(email.value, password.value)
    if (success) {
      toast.success('Přihlášení proběhlo úspěšně')
      // Admin přihlášení přesměruje do administrace
      const redirectPath = route.query.redirect as string | undefined
      if (redirectPath && redirectPath.startsWith('/admin')) {
        router.push(redirectPath)
      } else {
        router.push('/admin')
      }
    } else {
      error.value = 'Neplatné přihlašovací údaje'
    }
  } catch (err: any) {
    console.error('Chyba při přihlášení do členské sekce:', err)
    error.value = err.message ?? 'Přihlášení se nezdařilo'
  } finally {
    loading.value = false
  }
}

const handleDepartmentLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const response = await $fetch('/api/member-auth/login', {
      method: 'POST',
      body: {
        memberEmail: memberEmail.value,
        password: departmentPassword.value
      }
    }) as { success: boolean; department?: any; departments?: any[]; member?: any }

    if (response.success) {
      // Debug: Zobraz, co přišlo z API
      console.log('Login response from API:', response)

      // Uložíme informaci o oddílu + členovi do localStorage
      if (process.client) {
        // Zajistíme, že department má permissions včetně nových práv pro správu členů
        const departmentWithPermissions = {
          ...response.department,
          permissions: {
            repertoire_view: response.department.permissions?.repertoire_view ?? true,
            repertoire_edit: response.department.permissions?.repertoire_edit ?? false,
            member_directory_view: response.department.permissions?.member_directory_view ?? true,
            members_area_view: response.department.permissions?.members_area_view ?? true,
            member_resources_view: response.department.permissions?.member_resources_view ?? true,
            member_resources_upload: response.department.permissions?.member_resources_upload ?? false,
            member_management_create: response.department.permissions?.member_management_create ?? false,
            member_management_edit: response.department.permissions?.member_management_edit ?? false,
            member_management_delete: response.department.permissions?.member_management_delete ?? false
          }
        }

        const loginData = {
          department: departmentWithPermissions,
          departments: response.departments || [], // Všechny oddíly člena
          member: response.member // Info o konkrétním členovi
        }
        localStorage.setItem('memberDepartment', JSON.stringify(loginData.department))
        localStorage.setItem('memberDepartments', JSON.stringify(loginData.departments))
        localStorage.setItem('memberUser', JSON.stringify(loginData.member))

        // Debug: Ověř, co se uložilo
        console.log('Stored in localStorage:', loginData)

        // Počkáme krátkou chvíli, aby se localStorage stihl uložit
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const memberName = response.member?.full_name || memberEmail.value
      toast.success(`Vítejte, ${memberName}!`)

      // Použijeme nextTick pro zajištění, že localStorage je uložený
      await nextTick()
      redirectTo(route.query.redirect as string | undefined)
    } else {
      error.value = 'Neplatný email nebo heslo'
    }
  } catch (err: any) {
    console.error('Chyba při přihlášení oddílu:', err)
    error.value = err.data?.statusMessage || 'Přihlášení se nezdařilo'
  } finally {
    loading.value = false
  }
}

// Kontrola při načtení stránky - pokud je už přihlášen, přesměruj
onMounted(async () => {
  if (process.client) {
    await checkUser()
    if (user.value || localStorage.getItem('memberDepartment')) {
      redirectTo(route.query.redirect as string | undefined)
    }
  }
})
</script>

