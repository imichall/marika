<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="handleClose" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
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
            <DialogPanel class="bg-white p-6 rounded-lg w-full max-w-md">
              <DialogTitle as="h2" class="text-2xl font-bold mb-4">
                {{ concert.title }}
              </DialogTitle>

              <!-- Progress Steps -->
              <div class="mb-8">
                <div class="flex justify-between mb-2">
                  <span
                    v-for="(step, index) in steps"
                    :key="step"
                    class="text-sm font-medium"
                    :class="{
                      'text-red-600': currentStep === index,
                      'text-gray-500': currentStep !== index,
                    }"
                  >
                    {{ step }}
                  </span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full">
                  <div
                    class="h-full bg-red-600 rounded-full transition-all duration-300"
                    :style="{
                      width: `${(currentStep / (steps.length - 1)) * 100}%`,
                    }"
                  ></div>
                </div>
              </div>

              <div class="space-y-4">
                <!-- Step 1: Výběr vstupenek -->
                <div v-if="currentStep === 0">
                  <div class="flex justify-between items-center text-gray-600">
                    <span>Datum koncertu:</span>
                    <span class="font-medium">{{
                      formatDate(concert.date)
                    }}</span>
                  </div>

                  <div class="flex justify-between items-center text-gray-600">
                    <span>Začátek koncertu:</span>
                    <span class="font-medium"
                      ><strong>{{ concert.time }}</strong></span
                    >
                  </div>

                  <div class="flex justify-between items-center text-gray-600">
                    <span>Cena za vstupenku:</span>
                    <span class="font-medium">{{ concert.price }} Kč</span>
                  </div>

                  <div class="border-t border-b border-gray-200 py-4 my-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Počet vstupenek
                    </label>
                    <div class="flex items-center gap-4">
                      <button
                        @click="decrementTickets"
                        class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded"
                        :disabled="ticketCount <= 1"
                      >
                        -
                      </button>
                      <input
                        v-model="ticketCount"
                        type="number"
                        min="1"
                        max="10"
                        class="w-20 text-center p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        @click="incrementTickets"
                        class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded"
                        :disabled="ticketCount >= 10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div
                    class="flex justify-between items-center text-lg font-bold"
                  >
                    <span>Celková cena:</span>
                    <span class="text-red-600">{{ totalPrice }} Kč</span>
                  </div>
                </div>

                <!-- Step 2: Kontaktní údaje -->
                <div v-if="currentStep === 1" class="space-y-4">
                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      Jméno a příjmení
                    </label>
                    <input
                      v-model="contactInfo.name"
                      type="text"
                      required
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      :class="{ 'border-red-500': errors.name }"
                    />
                    <p v-if="errors.name" class="text-red-500 text-sm mt-1">
                      {{ errors.name }}
                    </p>
                  </div>

                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                      E-mail
                    </label>
                    <input
                      v-model="contactInfo.email"
                      type="email"
                      required
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      :class="{ 'border-red-500': errors.email }"
                    />
                    <p v-if="errors.email" class="text-red-500 text-sm mt-1">
                      {{ errors.email }}
                    </p>
                  </div>
                </div>

                <!-- Step 3: Platební údaje -->
                <div v-if="currentStep === 2" class="space-y-6">
                  <div class="text-center">
                    <h3 class="text-lg font-bold mb-2">Platební údaje</h3>
                    <p class="text-gray-600">
                      Prosím, použijte následující údaje k platbě:
                    </p>
                  </div>

                  <div class="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600">Částka:</span>
                      <span class="font-bold">{{ totalPrice }} Kč</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600">Číslo účtu:</span>
                      <span class="font-bold"
                        >{{ concert.account_number }}/{{
                          concert.bank_code
                        }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600">Variabilní symbol:</span>
                      <span class="font-bold">{{
                        concert.variable_symbol
                      }}</span>
                    </div>
                  </div>

                  <div class="flex justify-center">
                    <ConcertQRCode
                      :concert="concert"
                      :ticket-count="ticketCount"
                      class="w-48 h-48"
                    />
                  </div>

                  <div class="text-center text-sm text-gray-500">
                    <p>
                      Po zaplacení vám bude zaslán e-mail s potvrzením na adresu
                      {{ contactInfo.email }}
                    </p>
                  </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="flex justify-end space-x-4 mt-6">
                  <button
                    v-if="currentStep > 0"
                    @click="currentStep--"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
                  >
                    Zpět
                  </button>
                  <button
                    v-if="currentStep === 0"
                    @click="handleClose"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
                  >
                    Zrušit
                  </button>
                  <button
                    v-if="currentStep < steps.length - 1"
                    @click="handleNextStep"
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                  >
                    Pokračovat
                  </button>
                  <button
                    v-if="currentStep === steps.length - 1"
                    @click="handleClose"
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                  >
                    Dokončit
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import ConcertQRCode from "~/components/ConcertQRCode.vue";
import { useTicketOrders } from "~/composables/useTicketOrders";
import { useToast } from "~/composables/useToast";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  concert: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "purchase"]);

const steps = ["Vstupenky", "Kontaktní údaje", "Platba"];
const currentStep = ref(0);
const ticketCount = ref(1);
const contactInfo = ref({
  name: "",
  email: "",
});
const errors = ref({
  name: "",
  email: "",
});

const totalPrice = computed(() => {
  return Number(props.concert.price) * ticketCount.value;
});

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateStep = () => {
  errors.value = {};
  if (currentStep.value === 1) {
    if (!contactInfo.value.name) {
      errors.value.name = "Vyplňte prosím jméno";
      return false;
    }
    if (!contactInfo.value.email) {
      errors.value.email = "Vyplňte prosím email";
      return false;
    }
    if (!validateEmail(contactInfo.value.email)) {
      errors.value.email = "Zadejte platný email";
      return false;
    }
  }
  return true;
};

const handleNextStep = () => {
  if (validateStep()) {
    currentStep.value++;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("cs-CZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const incrementTickets = () => {
  if (ticketCount.value < 10) {
    ticketCount.value++;
  }
};

const decrementTickets = () => {
  if (ticketCount.value > 1) {
    ticketCount.value--;
  }
};

const { createOrder } = useTicketOrders();
const toast = useToast();

const handleClose = () => {
  if (currentStep.value === steps.length - 1) {
    return;
  }
  currentStep.value = 0;
  ticketCount.value = 1;
  contactInfo.value = {
    name: "",
    email: "",
  };
  errors.value = {};
  emit("close");
};

const closeModal = async () => {
  if (currentStep.value === steps.length - 1) {
    try {
      await createOrder({
        concert_id: props.concert.id,
        customer_name: contactInfo.value.name,
        customer_email: contactInfo.value.email,
        ticket_count: ticketCount.value,
        total_price: totalPrice.value,
        variable_symbol: props.concert.variable_symbol,
      });

      toast.success("Objednávka byla úspěšně vytvořena");

      currentStep.value = 0;
      ticketCount.value = 1;
      contactInfo.value = {
        name: "",
        email: "",
      };
      errors.value = {};
      emit("close");
    } catch (err) {
      console.error("Error saving order:", err);
      toast.error("Nepodařilo se vytvořit objednávku");
    }
  } else {
    handleClose();
  }
};
</script>