import { ref } from 'vue';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const toasts = ref<Toast[]>([]);
let nextId = 1;

export const useToast = () => {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = nextId++;
    toasts.value.push({ ...toast, id });

    // Automaticky odstraníme toast po 5 sekundách
    setTimeout(() => {
      removeToast(id);
    }, 5000);

    return id;
  };

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (message: string) => addToast({ message, type: 'success' });
  const error = (message: string) => addToast({ message, type: 'error' });
  const info = (message: string) => addToast({ message, type: 'info' });
  const warning = (message: string) => addToast({ message, type: 'warning' });

  return {
    toasts,
    success,
    error,
    info,
    warning,
    remove: removeToast
  };
};