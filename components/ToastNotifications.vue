<template>
  <div class="fixed right-4 z-40" style="top: 80px">
    <TransitionGroup name="toast" tag="div" class="space-y-4">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="transform transition-all duration-300 ease-in-out bg-white shadow-lg rounded-lg pointer-events-auto ring-1 inline-block whitespace-nowrap"
        :class="{
          'ring-green-600/20 bg-green-50': toast.type === 'success',
          'ring-red-600/20 bg-red-50': toast.type === 'error',
          'ring-blue-600/20 bg-blue-50': toast.type === 'info',
          'ring-yellow-600/20 bg-yellow-50': toast.type === 'warning',
        }"
        @mouseenter="pauseToast(toast.id)"
        @mouseleave="resumeToast(toast.id)"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <!-- Success Icon -->
              <svg
                v-if="toast.type === 'success'"
                class="h-6 w-6 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <!-- Error Icon -->
              <svg
                v-if="toast.type === 'error'"
                class="h-6 w-6 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <!-- Info Icon -->
              <svg
                v-if="toast.type === 'info'"
                class="h-6 w-6 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
                class="h-6 w-6 text-yellow-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p
                class="text-sm font-medium"
                :class="{
                  'text-green-900': toast.type === 'success',
                  'text-red-900': toast.type === 'error',
                  'text-blue-900': toast.type === 'info',
                  'text-yellow-900': toast.type === 'warning',
                }"
              >
                {{ toast.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeToast(toast.id)"
                class="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <span class="sr-only">Zavřít</span>
                <svg
                  class="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <!-- Progress bar -->
        <div
          class="h-1 bg-gray-100 rounded-b-lg overflow-hidden"
          :class="{
            'bg-green-100': toast.type === 'success',
            'bg-red-100': toast.type === 'error',
            'bg-blue-100': toast.type === 'info',
            'bg-yellow-100': toast.type === 'warning',
          }"
        >
          <div
            class="h-full transition-all duration-[1ms] ease-linear"
            :class="{
              'bg-green-500': toast.type === 'success',
              'bg-red-500': toast.type === 'error',
              'bg-blue-500': toast.type === 'info',
              'bg-yellow-500': toast.type === 'warning',
            }"
            :style="{
              width: `${getProgress(toast.id)}%`,
              transitionProperty: 'width',
              transitionTimingFunction: 'linear',
            }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "~/composables/useToast";
import { ref, onMounted, onUnmounted } from "vue";

const { toasts, remove: removeToast } = useToast();

interface ToastProgress {
  startTime: number;
  pausedAt?: number;
  remaining?: number;
  duration: number;
  progress: number;
}

const toastProgress = ref<Record<number, ToastProgress>>({});
let animationFrame: number;

const initToastProgress = (id: number, duration = 5000) => {
  toastProgress.value[id] = {
    startTime: Date.now(),
    duration,
    progress: 100,
  };
};

const pauseToast = (id: number) => {
  const progress = toastProgress.value[id];
  if (progress && !progress.pausedAt) {
    progress.pausedAt = Date.now();
    progress.remaining =
      progress.duration - (progress.pausedAt - progress.startTime);
  }
};

const resumeToast = (id: number) => {
  const progress = toastProgress.value[id];
  if (progress && progress.pausedAt) {
    progress.startTime = Date.now() - (progress.duration - progress.remaining!);
    progress.pausedAt = undefined;
    progress.remaining = undefined;
  }
};

const updateProgress = () => {
  if (!toasts.value.length) return;

  toasts.value.forEach((toast) => {
    const progress = toastProgress.value[toast.id];
    if (!progress) return;

    if (!progress.pausedAt) {
      const elapsed = Date.now() - progress.startTime;
      const remaining = Math.max(0, progress.duration - elapsed);
      progress.progress = (remaining / progress.duration) * 100;

      if (progress.progress <= 0) {
        removeToast(toast.id);
      }
    }
  });

  animationFrame = requestAnimationFrame(updateProgress);
};

const getProgress = (id: number) => {
  const progress = toastProgress.value[id];
  if (!progress) {
    initToastProgress(id);
    return 100;
  }
  return progress.progress;
};

// Sledujeme změny v toasts a inicializujeme progress pro nové toasty
watch(toasts, (newToasts) => {
  newToasts.forEach((toast) => {
    if (!toastProgress.value[toast.id]) {
      initToastProgress(toast.id);
    }
  });
});

onMounted(() => {
  animationFrame = requestAnimationFrame(updateProgress);
});

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>