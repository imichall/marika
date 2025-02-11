import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

interface Settings {
  marikaSingers: {
    accountPrefix: string
    accountNumber: string
    bankCode: string
  }
  five: {
    accountPrefix: string
    accountNumber: string
    bankCode: string
  }
  voices: {
    accountPrefix: string
    accountNumber: string
    bankCode: string
  }
}

export const useSettings = () => {
  const settings = ref<Settings>({
    marikaSingers: {
      accountPrefix: '',
      accountNumber: '',
      bankCode: '3030'
    },
    five: {
      accountPrefix: '',
      accountNumber: '',
      bankCode: '3030'
    },
    voices: {
      accountPrefix: '',
      accountNumber: '',
      bankCode: '3030'
    }
  })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const supabase = useSupabaseClient()

  const fetchSettings = async () => {
    loading.value = true
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          // Převedeme data do nového formátu
          Object.keys(settings.value).forEach((key) => {
            if (data[key]) {
              const parts = data[key].accountNumber.split('-')
              if (parts.length === 2) {
                settings.value[key].accountPrefix = parts[0]
                settings.value[key].accountNumber = parts[1]
              } else {
                settings.value[key].accountPrefix = ''
                settings.value[key].accountNumber = data[key].accountNumber
              }
              settings.value[key].bankCode = data[key].bankCode
            }
          })
        }
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (groupId: keyof Settings, accountNumber: string, bankCode: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('settings')
        .update({
          [groupId]: {
            accountNumber,
            bankCode
          }
        })
        .eq('id', 1) // Předpokládáme, že máme pouze jeden záznam s ID 1
        .select()
        .single()

      if (err) throw err

      if (data) {
        settings.value[groupId] = {
          accountNumber,
          bankCode
        }
      }
    } catch (err: any) {
      console.error('Error updating settings:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings
  }
}
