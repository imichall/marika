<template>
  <div class="space-y-4">
    <h3 class="font-bold text-lg">Platební údaje pro QR kód</h3>
    <div class="grid grid-cols-1 gap-4">
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Číslo účtu
        </label>
        <input
          v-model="accountNumber"
          type="text"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="123456789/0100"
        />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Částka (Kč)
        </label>
        <input
          v-model="amount"
          type="number"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Variabilní symbol
        </label>
        <input
          v-model="variableSymbol"
          type="text"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Zpráva pro příjemce
        </label>
        <input
          v-model="message"
          type="text"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
    </div>

    <div v-if="qrCodeData" class="flex justify-center">
      <img :src="qrCodeData" alt="QR kód pro platbu" class="max-w-[200px]" />
    </div>
  </div>
</template>

<script setup>
import { toDataURL } from "qrcode";

const props = defineProps({
  concertTitle: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const accountNumber = ref("123456789/0100");
const amount = ref(props.price);
const variableSymbol = ref("");
const message = ref(props.concertTitle);
const qrCodeData = ref("");

// Generování QR kódu při změně hodnot
watch(
  [accountNumber, amount, variableSymbol, message],
  async () => {
    try {
      // Formát pro QR platbu (short payment descriptor)
      const qrData = `SPD*1.0*ACC:${accountNumber.value}*AM:${
        amount.value
      }*CC:CZK*MSG:${message.value}${
        variableSymbol.value ? "*VS:" + variableSymbol.value : ""
      }`;

      qrCodeData.value = await toDataURL(qrData);
    } catch (err) {
      console.error("Chyba při generování QR kódu:", err);
    }
  },
  { immediate: true }
);

// Exportujeme data pro rodiče
defineExpose({
  getQRData: () => ({
    accountNumber: accountNumber.value,
    amount: amount.value,
    variableSymbol: variableSymbol.value,
    message: message.value,
    qrCodeData: qrCodeData.value,
  }),
});
</script>