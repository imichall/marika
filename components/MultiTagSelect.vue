<template>
  <div class="relative">
    <!-- Input field -->
    <input
      ref="inputRef"
      :value="searchQuery"
      @input="handleInput"
      @focus="isOpen = true"
      @blur="handleBlur"
      @keydown.enter.prevent="handleEnter"
      :placeholder="selectedTags.length > 0 ? 'Vyberte další tag...' : placeholder"
      :required="required && selectedTags.length === 0"
      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
      :class="inputClass"
    />

    <!-- Selected tags display - below input -->
    <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-1.5 mt-2">
      <span
        v-for="tagSlug in selectedTags"
        :key="tagSlug"
        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border shadow-sm transition-all duration-200"
        :style="getTagStyle(tagSlug)"
      >
        <span class="leading-tight">{{ getTagName(tagSlug) }}</span>
        <button
          @click.prevent="removeTag(tagSlug)"
          class="hover:opacity-80 hover:scale-110 transition-all duration-200 ml-0.5 flex items-center justify-center rounded-full hover:bg-black/10 p-0.5 -mr-0.5"
          type="button"
          title="Odebrat"
        >
          <span class="material-icons-outlined text-[14px] leading-none">close</span>
        </button>
      </span>
    </div>

    <!-- Dropdown options -->
    <Transition name="dropdown">
      <div
        v-if="isOpen && (filteredOptions.length > 0 || showCreateOption)"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
      >
        <template v-if="filteredOptions.length > 0">
          <div
            v-for="option in filteredOptions"
            :key="option.value"
            @mousedown.prevent="selectOption(option)"
            class="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors flex items-center justify-between"
            :class="{ 'bg-indigo-50': isSelected(option.value) }"
          >
            <span>{{ option.label }}</span>
            <span
              v-if="isSelected(option.value)"
              class="material-icons-outlined text-indigo-600 text-sm"
            >
              check_circle
            </span>
          </div>
        </template>

        <!-- Create new option -->
        <div
          v-if="showCreateOption"
          @mousedown.prevent="createNewOption"
          @click.prevent="createNewOption"
          :class="[
            'px-4 py-2.5 hover:bg-green-50 cursor-pointer transition-colors',
            filteredOptions.length > 0 ? 'border-t border-gray-200 border-dashed' : ''
          ]"
        >
          <div class="flex items-center gap-2 text-green-600">
            <span class="material-icons-outlined text-base">add_circle</span>
            <span class="font-medium text-sm">Vytvořit "{{ searchQuery.trim() }}"</span>
            <span class="ml-auto text-xs text-gray-500">(Enter)</span>
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
  modelValue: string[];
  options: Option[];
  placeholder?: string;
  required?: boolean;
  canCreate?: boolean;
  onCreate?: (name: string) => Promise<any>;
  inputClass?: string;
  getTagName?: (slug: string) => string;
  getTagStyle?: (slug: string) => any;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Vyberte tagy...",
  required: false,
  canCreate: false,
  inputClass: "",
  getTagName: (slug: string) => slug,
  getTagStyle: () => null,
});

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const inputRef = ref<HTMLInputElement | null>(null);
const isCreating = ref(false);

const selectedTags = computed(() => props.modelValue || []);

const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    // Pokud není vyhledávání, zobrazíme všechny možnosti kromě už vybraných
    return props.options.filter(
      (option) => !selectedTags.value.includes(option.value)
    );
  }
  const query = searchQuery.value.toLowerCase();
  return props.options.filter(
    (option) =>
      option.label.toLowerCase().includes(query) &&
      !selectedTags.value.includes(option.value)
  );
});

const showCreateOption = computed(() => {
  // Pokud není text nebo nemáme oprávnění vytvářet, nezobrazíme možnost
  if (!searchQuery.value?.trim()) {
    return false;
  }

  // Pokud nemáme funkci pro vytváření nebo oprávnění, nezobrazíme
  if (!props.canCreate || !props.onCreate) {
    return false;
  }

  const trimmedQuery = searchQuery.value.trim().toLowerCase();

  // Pokud existuje přesná shoda v options (label nebo value), nezobrazíme možnost vytvořit
  const exactMatch = props.options.some(
    (opt) =>
      opt.label.toLowerCase() === trimmedQuery ||
      opt.value.toLowerCase() === trimmedQuery
  );

  // Pokud už je tag vybraný, také nezobrazíme
  const alreadySelected = selectedTags.value.some(
    (tagSlug) => tagSlug.toLowerCase() === trimmedQuery
  );

  // Zobrazíme možnost vytvořit pouze pokud není přesná shoda a tag není už vybraný
  return !exactMatch && !alreadySelected && trimmedQuery.length > 0;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;
      // Vždy otevřeme dropdown když uživatel píše
      isOpen.value = true;
};

const isSelected = (value: string) => {
  return selectedTags.value.includes(value);
};

const selectOption = (option: Option) => {
  if (!isSelected(option.value)) {
    emit("update:modelValue", [...selectedTags.value, option.value]);
  } else {
    removeTag(option.value);
  }
  searchQuery.value = "";
  isOpen.value = false;
};

const removeTag = (tagSlug: string) => {
  emit(
    "update:modelValue",
    selectedTags.value.filter((t) => t !== tagSlug)
  );
};

const handleBlur = (event: FocusEvent) => {
  // Delay to allow mousedown on options to fire first
  setTimeout(() => {
    // Pokud nedojde k kliknutí na možnost, zavřeme dropdown
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!relatedTarget || !relatedTarget.closest('.absolute')) {
      isOpen.value = false;
      // Resetujeme searchQuery pouze pokud nejsme v procesu vytváření
      if (!isCreating.value) {
        searchQuery.value = "";
      }
    }
  }, 200);
};

const handleEnter = () => {
  if (!searchQuery.value.trim()) return;

  // Pokud je možnost vytvořit, vytvoříme ji
  if (showCreateOption.value && props.canCreate && props.onCreate) {
    createNewOption();
  } else if (filteredOptions.value.length > 0) {
    // Jinak vybereme první možnost
    selectOption(filteredOptions.value[0]);
  }
};

const createNewOption = async () => {
  if (!props.onCreate || isCreating.value || !searchQuery.value.trim()) {
    console.log("Cannot create:", {
      hasOnCreate: !!props.onCreate,
      isCreating: isCreating.value,
      hasQuery: !!searchQuery.value.trim()
    });
    return;
  }

  isCreating.value = true;
  try {
    const trimmedName = searchQuery.value.trim();
    console.log("Creating tag:", trimmedName);
    const newOption = await props.onCreate(trimmedName);
    console.log("Created tag result:", newOption);
    if (newOption && newOption.slug) {
      if (!isSelected(newOption.slug)) {
        emit("update:modelValue", [...selectedTags.value, newOption.slug]);
      }
      searchQuery.value = "";
      isOpen.value = false;
    }
  } catch (err) {
    console.error("Error creating option:", err);
  } finally {
    isCreating.value = false;
  }
};

watch(isOpen, (newVal) => {
  if (newVal && inputRef.value) {
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease-out;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>

