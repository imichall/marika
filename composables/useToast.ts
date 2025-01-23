import { useToast as useVueToast } from 'vue-toastification'

export const useToast = () => {
  const toast = useVueToast()

  return {
    success: (message: string) => {
      toast.success(message, {
        timeout: 3000
      })
    },
    error: (message: string) => {
      toast.error(message, {
        timeout: 5000
      })
    },
    warning: (message: string) => {
      toast.warning(message, {
        timeout: 4000
      })
    },
    info: (message: string) => {
      toast.info(message, {
        timeout: 3000
      })
    }
  }
}