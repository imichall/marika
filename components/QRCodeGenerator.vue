<template>
  <div class="space-y-4">
    <h3 class="font-bold text-lg">Platební údaje pro QR kód</h3>
    <div class="grid grid-cols-1 gap-4">
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Číslo účtu
          </label>
          <input
            v-model="accountNumber"
            type="text"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            :class="{ 'border-red-500': accountNumberError }"
            placeholder="123456789"
            @input="validateAccountNumber"
          />
          <p v-if="accountNumberError" class="text-red-500 text-sm mt-1">
            {{ accountNumberError }}
          </p>
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Kód banky
          </label>
          <select
            v-model="bankCode"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="0100">0100 - Komerční banka</option>
            <option value="0300">0300 - ČSOB</option>
            <option value="0600">0600 - MONETA Money Bank</option>
            <option value="0710">0710 - Česká národní banka</option>
            <option value="0800">0800 - Česká spořitelna</option>
            <option value="2010">2010 - Fio banka</option>
            <option value="2700">2700 - UniCredit Bank</option>
            <option value="3030">3030 - Air Bank</option>
            <option value="5500">5500 - Raiffeisenbank</option>
            <option value="6210">6210 - mBank</option>
          </select>
        </div>
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
          maxlength="10"
          @input="validateVariableSymbol"
        />
        <p v-if="variableSymbolError" class="text-red-500 text-sm mt-1">
          {{ variableSymbolError }}
        </p>
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
import { ref, computed, watch } from "vue";
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
  modelValue: {
    type: String,
    default: "",
  },
  accountNumber: {
    type: String,
    default: "123456789",
  },
  bankCode: {
    type: String,
    default: "0100",
  },
});

const emit = defineEmits([
  "update:modelValue",
  "update:accountNumber",
  "update:bankCode",
]);

const accountNumber = computed({
  get: () => props.accountNumber,
  set: (value) => emit("update:accountNumber", value),
});

const bankCode = computed({
  get: () => props.bankCode,
  set: (value) => emit("update:bankCode", value),
});

const amount = ref(props.price);
const variableSymbol = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
const message = ref(props.concertTitle);
const qrCodeData = ref("");

const accountNumberError = ref("");
const variableSymbolError = ref("");

const validateAccountNumber = () => {
  const value = accountNumber.value;
  if (!/^\d+$/.test(value)) {
    accountNumberError.value = "Číslo účtu může obsahovat pouze číslice";
    return false;
  }
  if (value.length > 16) {
    accountNumberError.value = "Číslo účtu může mít maximálně 16 číslic";
    return false;
  }
  if (value.length < 2) {
    accountNumberError.value = "Číslo účtu musí mít alespoň 2 číslice";
    return false;
  }
  accountNumberError.value = "";
  return true;
};

const validateVariableSymbol = () => {
  const value = variableSymbol.value;
  if (value && !/^\d+$/.test(value)) {
    variableSymbolError.value =
      "Variabilní symbol může obsahovat pouze číslice";
    return false;
  }
  if (value && value.length > 10) {
    variableSymbolError.value =
      "Variabilní symbol může mít maximálně 10 číslic";
    return false;
  }
  variableSymbolError.value = "";
  return true;
};

// Generování QR kódu při změně hodnot
watch(
  [accountNumber, bankCode, amount, variableSymbol, message],
  async () => {
    try {
      if (!validateAccountNumber() || !validateVariableSymbol()) {
        qrCodeData.value = "";
        return;
      }

      // Formát pro QR platbu (short payment descriptor)
      const qrData = `SPD*1.0*ACC:${accountNumber.value}/${bankCode.value}*AM:${
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
    bankCode: bankCode.value,
    amount: amount.value,
    variableSymbol: variableSymbol.value,
    message: message.value,
    qrCodeData: qrCodeData.value,
  }),
});
</script>