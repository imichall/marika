<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog
      as="div"
      @close="$emit('update:modelValue', false)"
      class="relative z-50"
    >
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
              class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all dark:bg-slate-900 dark:text-slate-100"
            >
              <div class="flex items-center justify-between mb-6">
                <DialogTitle
                  as="h2"
                  class="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-red-300 dark:to-rose-300"
                >
                  {{ title }}
                </DialogTitle>
                <button
                  @click="$emit('update:modelValue', false)"
                  class="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                >
                  <span class="material-icons-outlined">close</span>
                </button>
              </div>

              <div class="relative">
                <slot />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

defineProps<{
  modelValue: boolean;
  title: string;
}>();

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>