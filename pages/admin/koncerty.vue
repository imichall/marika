<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Správa koncertů</h1>
      <button
        @click="showAddModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Přidat koncert
      </button>
    </div>

    <!-- Seznam koncertů -->
    <div class="grid gap-6">
      <div
        v-for="concert in concerts"
        :key="concert.id"
        class="bg-white p-6 rounded-lg shadow-md"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-xl">{{ concert.title }}</h3>
            <p class="text-gray-600">{{ concert.date }}</p>
            <p class="text-sm text-gray-500">Sekce: {{ concert.group }}</p>
            <p class="mt-2">{{ concert.desc }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="editConcert(concert)"
              class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Upravit
            </button>
            <button
              @click="deleteConcert(concert.id)"
              class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Smazat
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pro přidání/úpravu koncertu -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 class="text-xl font-bold mb-4">
          {{ editingConcert ? "Upravit" : "Přidat" }} koncert
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Název koncertu
              </label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Sekce
              </label>
              <select
                v-model="form.group"
                required
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Vyberte sekci</option>
                <option value="Marika Singers">Marika Singers</option>
                <option value="Voices">Voices</option>
                <option value="Five">Five</option>
              </select>
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Datum
              </label>
              <input
                v-model="form.date"
                type="date"
                required
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Cena vstupného
              </label>
              <input
                v-model="form.price"
                type="number"
                required
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Popis
            </label>
            <textarea
              v-model="form.desc"
              required
              rows="4"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            ></textarea>
          </div>

          <!-- QR kód generátor -->
          <QRCodeGenerator
            ref="qrGenerator"
            :concert-title="form.title"
            :price="form.price"
          />

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
              {{ editingConcert ? "Uložit" : "Přidat" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const {
  concerts,
  addConcert,
  updateConcert,
  deleteConcert: removeConcert,
} = useConcerts();
const showAddModal = ref(false);
const editingConcert = ref(null);
const qrGenerator = ref(null);

const form = ref({
  title: "",
  group: "",
  date: "",
  desc: "",
  price: 0,
  image: "", // Zde můžete přidat nahrávání obrázku
});

const resetForm = () => {
  form.value = {
    title: "",
    group: "",
    date: "",
    desc: "",
    price: 0,
    image: "",
  };
  editingConcert.value = null;
};

const closeModal = () => {
  showAddModal.value = false;
  resetForm();
};

const handleSubmit = () => {
  // Získáme data QR kódu
  const qrData = qrGenerator.value?.getQRData();

  const concertData = {
    ...form.value,
    qrCode: qrData,
  };

  if (editingConcert.value) {
    updateConcert(editingConcert.value.id, concertData);
  } else {
    addConcert(concertData);
  }

  closeModal();
};

const editConcert = (concert) => {
  editingConcert.value = concert;
  form.value = { ...concert };
  showAddModal.value = true;
};

const deleteConcert = (id) => {
  if (confirm("Opravdu chcete smazat tento koncert?")) {
    removeConcert(id);
  }
};
</script>