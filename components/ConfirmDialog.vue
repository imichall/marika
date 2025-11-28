<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" @close="handleCancel" class="relative z-50">
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
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all dark:bg-slate-900"
            >
              <!-- Icon and Title -->
              <div class="px-6 pt-6 pb-4">
                <div class="flex items-start gap-4">
                  <div
                    class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
                    :class="iconBackgroundClass"
                  >
                    <Icon :name="icon" :class="iconClass" class="text-2xl" />
                  </div>
                  <div class="flex-1">
                    <DialogTitle
                      as="h3"
                      class="text-lg font-semibold text-slate-900 dark:text-white"
                    >
                      {{ title }}
                    </DialogTitle>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {{ message }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div
                class="bg-slate-50 px-6 py-4 flex gap-3 justify-end dark:bg-slate-800/50"
              >
                <button
                  type="button"
                  class="inline-flex justify-center items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  @click="handleCancel"
                >
                  {{ cancelText }}
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                  :class="confirmButtonClass"
                  @click="handleConfirm"
                >
                  <Icon
                    v-if="confirmIcon"
                    :name="confirmIcon"
                    class="text-lg"
                  />
                  {{ confirmText }}
                </button>
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
import { computed } from "vue";

interface Props {
  modelValue: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: string;
  type?: "danger" | "warning" | "info" | "success";
}

const props = withDefaults(defineProps<Props>(), {
  title: "Potvrdit akci",
  confirmText: "Potvrdit",
  cancelText: "Zrušit",
  type: "danger",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const icon = computed(() => {
  switch (props.type) {
    case "danger":
      return "mdi:alert-circle-outline";
    case "warning":
      return "mdi:alert-outline";
    case "info":
      return "mdi:information-outline";
    case "success":
      return "mdi:check-circle-outline";
    default:
      return "mdi:alert-circle-outline";
  }
});

const iconClass = computed(() => {
  switch (props.type) {
    case "danger":
      return "text-red-600 dark:text-red-400";
    case "warning":
      return "text-orange-600 dark:text-orange-400";
    case "info":
      return "text-blue-600 dark:text-blue-400";
    case "success":
      return "text-green-600 dark:text-green-400";
    default:
      return "text-red-600 dark:text-red-400";
  }
});

const iconBackgroundClass = computed(() => {
  switch (props.type) {
    case "danger":
      return "bg-red-100 dark:bg-red-500/20";
    case "warning":
      return "bg-orange-100 dark:bg-orange-500/20";
    case "info":
      return "bg-blue-100 dark:bg-blue-500/20";
    case "success":
      return "bg-green-100 dark:bg-green-500/20";
    default:
      return "bg-red-100 dark:bg-red-500/20";
  }
});

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case "danger":
      return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
    case "warning":
      return "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500";
    case "info":
      return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
    case "success":
      return "bg-green-600 hover:bg-green-700 focus:ring-green-500";
    default:
      return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
  }
});

const handleConfirm = () => {
  emit("confirm");
  emit("update:modelValue", false);
};

const handleCancel = () => {
  emit("cancel");
  emit("update:modelValue", false);
};
</script>
