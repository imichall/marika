<template>
  <div class="space-y-4">
    <h3 class="font-bold text-lg">Platební údaje pro QR kód</h3>
    <div class="grid grid-cols-1 gap-4">
      <div class="grid grid-cols-4 gap-2">
        <!-- Předčíslí -->
        <div class="relative">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Předčíslí
          </label>
          <input
            v-model="accountPrefix"
            type="text"
            @input="accountPrefix = accountPrefix.replace(/\D/g, '')"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            :class="{
              'border-red-500': !isAccountLocked && accountPrefixError,
            }"
            placeholder="000000"
            :disabled="isAccountLocked"
          />
          <p
            v-if="!isAccountLocked && accountPrefixError"
            class="text-red-500 text-sm mt-1 absolute"
          >
            {{ accountPrefixError }}
          </p>
        </div>

        <!-- Číslo účtu -->
        <div class="relative col-span-2">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Číslo účtu
          </label>
          <input
            v-model="accountNumber"
            type="text"
            @input="handleAccountNumberInput($event.target.value)"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            :class="{
              'border-red-500': !isAccountLocked && accountNumberError,
            }"
            placeholder="0000000000"
            :disabled="isAccountLocked"
          />
          <p
            v-if="!isAccountLocked && accountNumberError"
            class="text-red-500 text-sm mt-1 absolute"
          >
            {{ accountNumberError }}
          </p>
        </div>

        <!-- Kód banky -->
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Kód banky
          </label>
          <select
            v-model="bankCode"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            :disabled="isAccountLocked"
          >
            <option value="0100">0100 - KB</option>
            <option value="0300">0300 - ČSOB</option>
            <option value="0600">0600 - MONETA</option>
            <option value="0710">0710 - ČNB</option>
            <option value="0800">0800 - ČS</option>
            <option value="2010">2010 - Fio</option>
            <option value="2700">2700 - UniCredit</option>
            <option value="3030">3030 - Air Bank</option>
            <option value="5500">5500 - RB</option>
            <option value="6210">6210 - mBank</option>
          </select>
        </div>
      </div>

      <div v-if="!isAccountLocked" class="flex justify-end">
        <button
          @click="saveBankDetails"
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200"
        >
          Uložit do nastavení
        </button>
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
import { ref, computed, watch, onMounted } from "vue";
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
  selectedGroup: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "update:accountNumber",
  "update:bankCode",
]);

const accountPrefix = ref("");
const accountNumber = ref("");
const accountPrefixError = ref("");
const accountNumberError = ref("");
const bankCode = ref("3030");
const amount = ref(props.price);
const variableSymbol = ref("");
const message = ref(props.concertTitle);
const qrCodeData = ref("");
const isAccountLocked = ref(false);

const variableSymbolError = ref("");

// Validace pouze při zadávání nových údajů
const validateAccountPrefix = () => {
  if (isAccountLocked.value) return true;

  const value = accountPrefix.value;
  if (value === "") {
    accountPrefixError.value = "";
    return true;
  }
  if (!/^\d+$/.test(value)) {
    accountPrefixError.value = "Pouze číslice";
    return false;
  }
  if (value.length > 6) {
    accountPrefixError.value = "Max. 6 číslic";
    return false;
  }
  accountPrefixError.value = "";
  return true;
};

const validateAccountNumber = () => {
  if (isAccountLocked.value) return true;

  const value = accountNumber.value;
  if (!value) {
    accountNumberError.value = "";
    return true;
  }
  if (!/^\d+$/.test(value)) {
    accountNumberError.value = "Pouze číslice";
    return false;
  }
  if (value.length < 2 || value.length > 10) {
    accountNumberError.value = "2-10 číslic";
    return false;
  }
  accountNumberError.value = "";
  return true;
};

const handleAccountNumberInput = (value) => {
  // Nejprve odstraníme všechny nečíselné znaky kromě lomítka
  const cleanValue = value.replace(/[^\d/]/g, "");

  // Kontrola formátu s lomítkem
  if (cleanValue.includes("/")) {
    const [number, code] = cleanValue.split("/");
    // Ověříme, zda je kód banky platný
    const isValidBankCode = Array.from(
      document.querySelectorAll('select[v-model="bankCode"] option')
    ).some((option) => option.value === code);

    if (isValidBankCode) {
      // Nastavíme hodnoty
      accountNumber.value = number;
      bankCode.value = code;
      validateAccountNumber();
    }
  } else {
    accountNumber.value = cleanValue;
    validateAccountNumber();
  }
};

// Načtení bankovních údajů pro vybrané těleso
const loadBankDetails = async () => {
  try {
    const response = await fetch("/api/settings");
    if (response.ok) {
      const data = await response.json();
      const groupKey = props.selectedGroup.toLowerCase().replace(/\s+/g, "");
      const mappedKey =
        groupKey === "marikasingers" ? "marikaSingers" : groupKey;

      if (data[mappedKey] && data[mappedKey].accountNumber) {
        // Rozdělíme číslo účtu na předčíslí a číslo
        const parts = data[mappedKey].accountNumber.split("-");
        if (parts.length === 2) {
          accountPrefix.value = parts[0];
          accountNumber.value = parts[1];
        } else {
          accountPrefix.value = "";
          accountNumber.value = data[mappedKey].accountNumber;
        }
        bankCode.value = data[mappedKey].bankCode;
        isAccountLocked.value = true;
      } else {
        accountPrefix.value = "";
        accountNumber.value = "";
        isAccountLocked.value = false;
      }
    }
  } catch (err) {
    console.error("Error loading bank details:", err);
  }
};

// Sledování změny vybraného tělesa
watch(() => props.selectedGroup, loadBankDetails, { immediate: true });

// Uložení bankovních údajů do nastavení
const saveBankDetails = async () => {
  if (!validateAccountNumber() || !validateAccountPrefix()) {
    return;
  }

  try {
    const groupKey = props.selectedGroup.toLowerCase().replace(/\s+/g, "");
    const mappedKey = groupKey === "marikasingers" ? "marikaSingers" : groupKey;

    const currentSettings = await fetch("/api/settings").then((r) => r.json());
    const fullAccountNumber = accountPrefix.value
      ? `${accountPrefix.value}-${accountNumber.value}`
      : accountNumber.value;

    const updatedSettings = {
      ...currentSettings,
      [mappedKey]: {
        accountNumber: fullAccountNumber,
        bankCode: bankCode.value,
      },
    };

    const response = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedSettings),
    });

    if (response.ok) {
      isAccountLocked.value = true;
    }
  } catch (err) {
    console.error("Error saving bank details:", err);
  }
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

// Funkce pro odstranění diakritiky
const removeDiacritics = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Funkce pro výpočet kontrolních číslic IBAN
const calculateIBANCheckDigits = (bankCode, accountNumber) => {
  try {
    // 1. Připravíme číslo účtu doplněné nulami na 16 míst
    const accountPadded = accountNumber.padStart(16, "0");

    // 2. Sestavíme řetězec pro výpočet:
    // bankCode + accountNumber + CZ + 00
    const base = `${bankCode}${accountPadded}1235${"00"}`;

    // 3. Rozdělíme na části a počítáme modulo
    let remainder = 0;
    for (let i = 0; i < base.length; i++) {
      remainder = (remainder * 10 + parseInt(base.charAt(i))) % 97;
    }

    // 4. Vypočítáme kontrolní číslice
    const checkDigits = String(98 - remainder).padStart(2, "0");

    return checkDigits;
  } catch (err) {
    console.error("Error calculating IBAN check digits:", err);
    return "00"; // Fallback v případě chyby
  }
};

// Generování QR kódu při změně hodnot
watch(
  [accountPrefix, accountNumber, bankCode, amount, variableSymbol, message],
  async ([newPrefix, newNumber, newBankCode, newAmount, newVS, newMsg]) => {
    try {
      if (!newNumber || !newBankCode || !newAmount) {
        qrCodeData.value = "";
        return;
      }

      // Validace
      if (
        !validateAccountNumber() ||
        !validateAccountPrefix() ||
        !validateVariableSymbol()
      ) {
        qrCodeData.value = "";
        return;
      }

      // Formát pro QR platbu (short payment descriptor)
      const cleanMessage = removeDiacritics(newMsg || "");
      const formattedAmount = Number(newAmount).toFixed(2);

      // Sestavíme kompletní číslo účtu
      const fullAccountNumber = newPrefix ? newPrefix + newNumber : newNumber;

      // Vypočítáme kontrolní číslice a sestavíme IBAN
      const paddedAccount = fullAccountNumber.padStart(16, "0");
      const checkDigits = calculateIBANCheckDigits(newBankCode, paddedAccount);

      const qrData = `SPD*1.0*ACC:CZ${checkDigits}${newBankCode}${paddedAccount}*AM:${formattedAmount}*CC:CZK*MSG:${cleanMessage}${
        newVS ? "*X-VS:" + newVS : ""
      }`;

      qrCodeData.value = await toDataURL(qrData);
    } catch (err) {
      console.error("Chyba při generování QR kódu:", err);
      qrCodeData.value = "";
    }
  },
  { immediate: true }
);

// Exportujeme data pro rodiče
defineExpose({
  getQRData: () => ({
    accountNumber: accountPrefix.value
      ? `${accountPrefix.value}-${accountNumber.value}`
      : accountNumber.value,
    bankCode: bankCode.value,
    amount: amount.value,
    variableSymbol: variableSymbol.value,
    message: message.value,
    qrCodeData: qrCodeData.value,
  }),
});

watch(
  () => props.concertTitle,
  (newTitle) => {
    message.value = removeDiacritics(newTitle).toUpperCase();
  },
  { immediate: true }
);
</script>