<template>
  <div class="fixed top-4 right-4 z-50 space-y-4">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300',
          {
            'bg-green-50 text-green-800 border border-green-200':
              toast.type === 'success',
            'bg-red-50 text-red-800 border border-red-200':
              toast.type === 'error',
            'bg-blue-50 text-blue-800 border border-blue-200':
              toast.type === 'info',
            'bg-yellow-50 text-yellow-800 border border-yellow-200':
              toast.type === 'warning',
          },
        ]"
      >
        <div class="flex items-center">
          <!-- Success Icon -->
          <svg
            v-if="toast.type === 'success'"
            class="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>

          <!-- Error Icon -->
          <svg
            v-if="toast.type === 'error'"
            class="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>

          <!-- Info Icon -->
          <svg
            v-if="toast.type === 'info'"
            class="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          <!-- Warning Icon -->
          <svg
            v-if="toast.type === 'warning'"
            class="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>

          <span class="text-sm font-medium">{{ toast.message }}</span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { TransitionGroup } from "vue";
import { useToast } from "~/composables/useToast";

const { toasts } = useToast();
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>