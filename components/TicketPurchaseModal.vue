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
            <DialogPanel class="bg-white p-6 rounded-lg w-full max-w-xl">
              <DialogTitle as="h2" class="text-2xl font-bold mb-4">
                {{ concert.title }}
              </DialogTitle>

              <!-- Progress Steps -->
              <div
                v-if="!concert.is_voluntary && !concert.has_presale"
                class="mb-8"
              >
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
                <!-- Informace o koncertu -->
                <div>
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
                    <span>Vstupné:</span>
                    <span class="font-medium">
                      <template v-if="concert.is_voluntary">
                        Dobrovolné
                      </template>
                      <template v-else-if="!concert.has_presale">
                        {{ concert.price }} Kč
                        <template v-if="ticketCount > 1">
                          <span class="text-gray-500">
                            ({{ ticketCount }}× vstupenka, celkem
                            {{ totalPrice }} Kč)
                          </span>
                        </template>
                      </template>
                    </span>
                  </div>

                  <div
                    v-if="
                      !concert.is_voluntary &&
                      !concert.has_presale &&
                      currentStep === 0
                    "
                    class="border-t border-b border-gray-200 py-4 my-4"
                  >
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
                        class="w-20 text-center p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 touch-manipulation select-none"
                        style="-webkit-tap-highlight-color: transparent"
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
                    v-if="concert.is_voluntary"
                    class="bg-blue-50 p-4 rounded-lg mt-4"
                  >
                    <p class="text-blue-800">
                      Dobrovolné vstupné se platí na místě před začátkem
                      koncertu.
                    </p>
                  </div>

                  <div
                    v-if="concert.has_presale"
                    class="bg-yellow-50 p-4 rounded-lg mt-4"
                  >
                    <p class="text-yellow-800">
                      {{ concert.presale_text }}
                    </p>
                  </div>

                  <div
                    v-if="
                      !concert.is_voluntary &&
                      !concert.has_presale &&
                      currentStep === 0
                    "
                    class="flex justify-between items-center text-lg font-bold"
                  >
                    <span>Celková cena:</span>
                    <span class="text-red-600">{{ totalPrice }} Kč</span>
                  </div>
                </div>

                <!-- Step 2: Kontaktní údaje - pouze pro placené koncerty bez předprodeje -->
                <div
                  v-if="
                    !concert.is_voluntary &&
                    !concert.has_presale &&
                    currentStep === 1
                  "
                  class="space-y-4"
                >
                  <form
                    @submit.prevent="handleSubmit"
                    autocomplete="on"
                    class="space-y-4"
                  >
                    <div>
                      <label
                        for="name"
                        class="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Jméno a příjmení
                      </label>
                      <input
                        v-model="contactInfo.name"
                        type="text"
                        name="name"
                        id="name"
                        autocomplete="name"
                        inputmode="text"
                        required
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        :class="{ 'border-red-500': errors.name }"
                        placeholder="Vaše jméno"
                      />
                      <p v-if="errors.name" class="text-red-500 text-sm mt-1">
                        {{ errors.name }}
                      </p>
                    </div>

                    <div>
                      <label
                        for="email"
                        class="block text-gray-700 text-sm font-bold mb-2"
                      >
                        E-mail
                      </label>
                      <input
                        v-model="contactInfo.email"
                        type="email"
                        name="email"
                        id="email"
                        autocomplete="email"
                        inputmode="email"
                        required
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        :class="{ 'border-red-500': errors.email }"
                        placeholder="vas@email.cz"
                      />
                      <p v-if="errors.email" class="text-red-500 text-sm mt-1">
                        {{ errors.email }}
                      </p>
                    </div>
                  </form>
                </div>

                <!-- Step 3: Platební údaje - pouze pro placené koncerty bez předprodeje -->
                <div
                  v-if="
                    !concert.is_voluntary &&
                    !concert.has_presale &&
                    currentStep === 2
                  "
                  class="space-y-6"
                >
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
                      <span class="font-bold">
                        {{
                          formatAccountNumber(
                            bankDetails.accountNumber,
                            bankDetails.bankCode
                          )
                        }}
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600">Variabilní symbol:</span>
                      <span v-if="formattedVariableSymbol" class="font-bold">{{
                        formattedVariableSymbol
                      }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600">Zpráva pro příjemce:</span>
                      <span class="font-bold">{{
                        concert.payment_message || concert.title
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
                    <p class="mt-2">
                      Pro urychlení platby můžete použít QR kód výše
                    </p>
                  </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="flex justify-end space-x-4 mt-6">
                  <button
                    v-if="concert.is_voluntary || concert.has_presale"
                    @click="handleClose"
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                  >
                    Rozumím
                  </button>
                  <template v-else>
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
                      @click="handleSubmit"
                      class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                    >
                      Dokončit
                    </button>
                  </template>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- Potvrzovací modál -->
  <TransitionRoot appear :show="showConfirmationModal" as="template">
    <Dialog as="div" @close="handleConfirmationClose" class="relative z-50">
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
            <DialogPanel class="bg-white p-8 rounded-2xl w-full max-w-md">
              <div class="text-center">
                <span
                  class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6"
                >
                  <span class="material-icons-outlined text-3xl text-green-600"
                    >check_circle</span
                  >
                </span>
                <DialogTitle
                  as="h3"
                  class="text-2xl font-bold mb-4 text-gray-900"
                >
                  {{
                    props.concert.is_voluntary
                      ? "Rezervace vytvořena!"
                      : "Objednávka vytvořena!"
                  }}
                </DialogTitle>
                <div class="space-y-4">
                  <p class="text-gray-600">
                    <template v-if="props.concert.is_voluntary">
                      Děkujeme za vaši rezervaci, těšíme se na viděnou na
                      koncertě!
                    </template>
                    <template v-else>
                      Děkujeme za vaši objednávku. Po zaplacení vstupenky mailem
                      neposíláme, budou vás na vaše jméno čekat u vstupu na
                      koncert.<br />
                      Těšíme se na viděnou!
                    </template>
                  </p>

                  <template v-if="!props.concert.is_voluntary">
                    <div class="bg-gray-50 p-4 rounded-xl space-y-2 text-left">
                      <div class="flex justify-between items-center">
                        <span class="text-gray-600">Částka k úhradě:</span>
                        <span class="font-bold"
                          >{{ confirmedOrder.totalPrice }} Kč</span
                        >
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-gray-600">Číslo účtu:</span>
                        <span class="font-bold">{{
                          formatAccountNumber(
                            bankDetails.accountNumber,
                            bankDetails.bankCode
                          )
                        }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-gray-600">Variabilní symbol:</span>
                        <span class="font-bold">{{
                          formattedVariableSymbol
                        }}</span>
                      </div>
                    </div>

                    <!-- Rekapitulace koncertu -->
                    <div class="bg-gray-50 p-4 rounded-xl mt-4 text-left">
                      <h4 class="font-medium text-gray-900 mb-2">
                        Rekapitulace koncertu
                      </h4>
                      <div class="space-y-2">
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">Název:</span>
                          <span class="font-medium">{{
                            props.concert.title
                          }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">Datum:</span>
                          <span class="font-medium">{{
                            formatDate(props.concert.date)
                          }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">Čas:</span>
                          <span class="font-medium">{{
                            props.concert.time || "19:00"
                          }}</span>
                        </div>
                        <div
                          class="flex justify-between items-center border-t border-gray-200 pt-2 mt-2"
                        >
                          <span class="text-gray-600">Jednotková cena:</span>
                          <span class="font-medium"
                            >{{ props.concert.price }} Kč</span
                          >
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">Počet vstupenek:</span>
                          <span class="font-medium"
                            >{{ confirmedOrder.ticketCount }}×</span
                          >
                        </div>
                        <div
                          class="flex justify-between items-center border-t border-gray-200 pt-2 mt-2"
                        >
                          <span class="text-gray-700 font-medium">Celkem:</span>
                          <span class="font-bold text-lg">
                            {{ confirmedOrder.totalPrice }} Kč</span
                          >
                        </div>
                      </div>
                    </div>

                    <!-- Přidat do kalendáře -->
                    <div class="mt-4 flex justify-center gap-3">
                      <a
                        :href="generateGoogleCalendarUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <span class="material-icons-outlined mr-2 text-red-600"
                          >event</span
                        >
                        Google Calendar
                      </a>
                      <a
                        :href="generateICalUrl"
                        class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <span class="material-icons-outlined mr-2 text-blue-600"
                          >event</span
                        >
                        iCal (iOS)
                      </a>
                    </div>
                  </template>
                </div>

                <div class="mt-8">
                  <button
                    @click="handleConfirmationClose"
                    class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Rozumím
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
import { ref, computed, watch } from "vue";
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

const steps = computed(() => {
  if (props.concert.is_voluntary) {
    return [];
  }
  return ["Vstupenky", "Kontaktní údaje", "Platba"];
});
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
  if (props.concert.is_voluntary) return 0;
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

const bankDetails = ref({
  accountNumber: "",
  bankCode: "",
});

const loadBankDetails = async () => {
  try {
    // Nejdřív zkusíme načíst data z qr_session koncertu
    if (props.concert.qr_session) {
      try {
        const sessionData = JSON.parse(props.concert.qr_session);
        if (sessionData) {
          bankDetails.value = {
            accountNumber: sessionData.account,
            bankCode: sessionData.bank_code,
          };
          return;
        }
      } catch (e) {
        console.error("Error parsing qr_session:", e);
      }
    }

    // Pokud nemáme qr_session nebo se nepodařilo načíst, načteme z nastavení
    const response = await fetch("/api/settings");
    if (!response.ok) {
      throw new Error("Nepodařilo se načíst bankovní údaje");
    }

    const settings = await response.json();
    const groupKey = props.concert.group_name.toLowerCase().replace(/\s+/g, "");
    const mappedKey = groupKey === "marikasingers" ? "marikaSingers" : groupKey;

    if (!settings[mappedKey] || !settings[mappedKey].accountNumber) {
      throw new Error("Pro tuto skupinu nejsou nastaveny bankovní údaje");
    }

    bankDetails.value = settings[mappedKey];
  } catch (err) {
    console.error("Error loading bank details:", err);
    toast.error("Nepodařilo se načíst bankovní údaje");
  }
};

// Watch for modal closing and reset form
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      loadBankDetails();
      // Set ticketCount to 1 for voluntary admission
      if (props.concert.is_voluntary) {
        ticketCount.value = 1;
      }
    } else {
      resetForm();
    }
  }
);

const handleClose = () => {
  if (currentStep.value === steps.value.length - 1) {
    return;
  }
  resetForm();
  emit("close");
};

const resetForm = () => {
  currentStep.value = 0;
  ticketCount.value = 1;
  contactInfo.value = {
    name: "",
    email: "",
  };
  errors.value = {};
};

const formatAccountNumber = (accountNumber, bankCode) => {
  if (!accountNumber || !bankCode) return "";
  return `${accountNumber}/${bankCode}`;
};

// Přidáme computed pro formátovaný variabilní symbol
const formattedVariableSymbol = computed(() => {
  // Nejdřív zkusíme načíst VS z qr_session
  if (props.concert.qr_session) {
    try {
      const sessionData = JSON.parse(props.concert.qr_session);
      if (sessionData && sessionData.vs) {
        const cleanVS = sessionData.vs.replace(/\D/g, "").replace(/^0+/, "");
        return cleanVS || "";
      }
    } catch (e) {
      console.error("Error parsing qr_session for VS:", e);
    }
  }

  // Pokud nemáme VS v qr_session, použijeme z koncertu
  if (!props.concert.variable_symbol) return "";
  const cleanVS = props.concert.variable_symbol
    .replace(/\D/g, "")
    .replace(/^0+/, ""); // Odstraníme nečíselné znaky a přední nuly
  return cleanVS || ""; // Vrátíme prázdný řetězec, pokud by zbyly jen nuly
});

const closeModal = () => {
  resetForm();
  emit("close");
};

// Přidáme ref pro potvrzovací modál
const showConfirmationModal = ref(false);

// Uložíme hodnoty objednávky pro zobrazení v potvrzovacím modalu
const confirmedOrder = ref({
  ticketCount: 1,
  totalPrice: 0,
});

const handleSubmit = async () => {
  if (currentStep.value === steps.value.length - 1) {
    try {
      const orderData = {
        concert_id: props.concert.id,
        customer_name: contactInfo.value.name,
        customer_email: contactInfo.value.email,
        ticket_count: ticketCount.value,
        total_price: totalPrice.value,
        variable_symbol: formattedVariableSymbol.value,
        payment_details: props.concert.is_voluntary
          ? null
          : {
              account_number: bankDetails.value.accountNumber,
              bank_code: bankDetails.value.bankCode,
              amount: totalPrice.value,
              message: props.concert.payment_message || props.concert.title,
            },
      };

      // Uložíme hodnoty PŘED voláním API, aby se neztratily
      const savedTicketCount = ticketCount.value;
      const savedTotalPrice = totalPrice.value;
      const savedContactInfo = { ...contactInfo.value };

      console.log("Ukládám hodnoty:", {
        ticketCount: savedTicketCount,
        totalPrice: savedTotalPrice,
      });

      await createOrder(orderData);

      // Nastavíme hodnoty pro potvrzovací modál
      confirmedOrder.value = {
        ticketCount: savedTicketCount,
        totalPrice: savedTotalPrice,
      };

      console.log("Uložené hodnoty do confirmedOrder:", confirmedOrder.value);

      // Odeslání emailu s rekapitulací (nečekáme na odpověď, aby nezpomalilo UX)
      if (!props.concert.is_voluntary && savedContactInfo.email) {
        sendOrderConfirmationEmail({
          customerEmail: savedContactInfo.email,
          customerName: savedContactInfo.name,
          concertTitle: props.concert.title,
          concertDate: formatDate(props.concert.date),
          concertTime: props.concert.time || "19:00",
          ticketCount: savedTicketCount,
          unitPrice: Number(props.concert.price),
          totalPrice: savedTotalPrice,
          accountNumber: bankDetails.value.accountNumber,
          bankCode: bankDetails.value.bankCode,
          variableSymbol: formattedVariableSymbol.value,
          paymentMessage: props.concert.payment_message || props.concert.title,
        });
      }

      resetForm();
      emit("close");

      // Zobrazíme potvrzovací modál s malým zpožděním
      setTimeout(() => {
        showConfirmationModal.value = true;
      }, 50);
    } catch (err) {
      console.error("Error saving order:", err);
      toast.error(
        props.concert.is_voluntary
          ? "Nepodařilo se vytvořit rezervaci. Zkuste to prosím znovu."
          : "Nepodařilo se vytvořit objednávku. Zkuste to prosím znovu."
      );
    }
  }
};

// Funkce pro odeslání potvrzovacího emailu
const sendOrderConfirmationEmail = async (emailData) => {
  try {
    const response = await fetch("/api/send-order-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (result.success) {
      console.log("Order confirmation email sent successfully");
    } else {
      console.warn("Order confirmation email not sent:", result.message);
    }
  } catch (err) {
    console.error("Error sending order confirmation email:", err);
    // Neblokujeme proces - email je bonus, ne kritická funkce
  }
};

const handleConfirmationClose = () => {
  showConfirmationModal.value = false;
};

// Přidáme computed properties pro kalendáře
const generateGoogleCalendarUrl = computed(() => {
  const eventTitle = encodeURIComponent(props.concert.title);
  const eventDate = new Date(props.concert.date);
  const eventTime = props.concert.time || "19:00";
  const [hours, minutes] = eventTime.split(":");

  const startDate = new Date(eventDate);
  startDate.setHours(parseInt(hours), parseInt(minutes));

  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 2); // Předpokládáme délku koncertu 2 hodiny

  const start = startDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${start}/${end}`;
});

const generateICalUrl = computed(() => {
  const eventTitle = props.concert.title;
  const eventDate = new Date(props.concert.date);
  const eventTime = props.concert.time || "19:00";
  const [hours, minutes] = eventTime.split(":");

  const startDate = new Date(eventDate);
  startDate.setHours(parseInt(hours), parseInt(minutes));

  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 2);

  const icalData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${eventTitle}`,
    `DTSTART:${startDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}`,
    `DTEND:${endDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");

  return `data:text/calendar;charset=utf8,${encodeURIComponent(icalData)}`;
});
</script>
