<template>
  <div class="relative">
    <input
      ref="inputRef"
      :value="displayValue"
      @input="handleInput"
      @focus="isOpen = true"
      @blur="handleBlur"
      :placeholder="placeholder"
      :required="required"
      :class="inputClass || 'w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'"
    />

    <!-- Dropdown options -->
    <Transition name="dropdown">
      <div
        v-if="isOpen && filteredOptions.length > 0"
        class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-auto"
      >
        <div
          v-for="option in filteredOptions"
          :key="option.value"
          @mousedown.prevent="selectOption(option)"
          class="px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors text-gray-900 dark:text-gray-100"
        >
          {{ option.label }}
        </div>
      </div>
    </Transition>

    <!-- Create new option -->
    <Transition name="dropdown">
      <div
        v-if="isOpen && showCreateOption && canCreate"
        class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg"
      >
        <div
          @mousedown.prevent="createNewOption"
          class="px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-colors border-t border-gray-200 dark:border-gray-600 border-dashed"
        >
          <div class="flex items-center gap-2 text-green-600 dark:text-green-400">
            <span class="material-icons-outlined text-lg">add_circle</span>
            <span class="font-medium">Vytvořit "{{ searchQuery }}"</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";

interface Option {
  value: string;
  label: string;
}

interface Props {
  modelValue: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  canCreate?: boolean;
  onCreate?: (name: string) => Promise<any>;
  inputClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Vyberte nebo zadejte...",
  required: false,
  canCreate: false,
  inputClass: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const inputRef = ref<HTMLInputElement | null>(null);
const isCreating = ref(false);

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue);
});

const displayValue = computed(() => {
  if (isOpen.value) {
    return searchQuery.value;
  }
  return selectedOption.value?.label || props.modelValue || "";
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options;
  }
  return props.options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const showCreateOption = computed(() => {
  if (!props.canCreate || !searchQuery.value || isCreating.value) {
    return false;
  }
  // Show create option if no exact match exists
  const exactMatch = props.options.find(
    (opt) => opt.label.toLowerCase() === searchQuery.value.toLowerCase()
  );
  return !exactMatch;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;
  isOpen.value = true;
};

const selectOption = (option: Option) => {
  emit("update:modelValue", option.value);
  searchQuery.value = "";
  isOpen.value = false;
};

const handleBlur = (event: FocusEvent) => {
  // Delay to allow mousedown on options to fire first
  setTimeout(() => {
    isOpen.value = false;
    searchQuery.value = "";

    // If creating and blurred with non-matching value, reset
    if (!selectedOption.value && props.modelValue) {
      // Keep the value as is if it was set
    }
  }, 200);
};

const createNewOption = async () => {
  if (!props.onCreate || isCreating.value) return;

  isCreating.value = true;
  try {
    const newOption = await props.onCreate(searchQuery.value);
    if (newOption && newOption.slug) {
      emit("update:modelValue", newOption.slug);
      searchQuery.value = "";
      isOpen.value = false;
    }
  } catch (err) {
    console.error("Error creating option:", err);
  } finally {
    isCreating.value = false;
  }
};

watch(
  () => props.modelValue,
  (newVal) => {
    // Reset search query when value changes externally
    if (!isOpen.value) {
      searchQuery.value = "";
    }
  }
);

// Reset when opening
watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      inputRef.value?.select();
    });
  }
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>

