<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa referencí</h1>
      <button
        @click="showAddModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Přidat referenci
      </button>
    </div>

    <!-- Seznam referencí -->
    <div class="grid gap-6">
      <div
        v-for="testimonial in testimonials"
        :key="testimonial.id"
        class="bg-white p-6 rounded-lg shadow-md"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-lg">{{ testimonial.author }}</h3>
            <p v-if="testimonial.source" class="text-sm text-gray-600">
              {{ testimonial.source }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="editTestimonial(testimonial)"
              class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Upravit
            </button>
            <button
              @click="deleteTestimonial(testimonial.id)"
              class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Smazat
            </button>
          </div>
        </div>
        <p class="text-gray-700">{{ testimonial.text }}</p>
      </div>
    </div>

    <!-- Modal pro přidání/úpravu reference -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ editingTestimonial ? "Upravit" : "Přidat" }} referenci
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Autor
            </label>
            <input
              v-model="form.author"
              type="text"
              required
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Zdroj (volitelné)
            </label>
            <input
              v-model="form.source"
              type="text"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Text reference
            </label>
            <textarea
              v-model="form.text"
              required
              rows="4"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="closeModal"
              class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Zrušit
            </button>
            <button
              type="submit"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {{ editingTestimonial ? "Uložit" : "Přidat" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const { testimonials } = useTestimonials();
const showAddModal = ref(false);
const editingTestimonial = ref(null);

const form = ref({
  author: "",
  source: "",
  text: "",
});

const resetForm = () => {
  form.value = {
    author: "",
    source: "",
    text: "",
  };
  editingTestimonial.value = null;
};

const closeModal = () => {
  showAddModal.value = false;
  resetForm();
};

const handleSubmit = () => {
  if (editingTestimonial.value) {
    // Aktualizace existující reference
    const index = testimonials.value.findIndex(
      (t) => t.id === editingTestimonial.value.id
    );
    if (index !== -1) {
      testimonials.value[index] = {
        ...testimonials.value[index],
        ...form.value,
      };
    }
  } else {
    // Přidání nové reference
    const newTestimonial = {
      id: Date.now(), // Jednoduchý způsob generování ID
      ...form.value,
    };
    testimonials.value.push(newTestimonial);
  }
  closeModal();
};

const editTestimonial = (testimonial) => {
  editingTestimonial.value = testimonial;
  form.value = {
    author: testimonial.author,
    source: testimonial.source || "",
    text: testimonial.text,
  };
  showAddModal.value = true;
};

const deleteTestimonial = (id) => {
  if (confirm("Opravdu chcete smazat tuto referenci?")) {
    const index = testimonials.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      testimonials.value.splice(index, 1);
    }
  }
};
</script>