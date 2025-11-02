<template>
  <div class="space-y-4">
    <h3 class="font-bold text-lg text-gray-900 dark:text-white">Platební údaje pro QR kód</h3>
    <div class="grid grid-cols-1 gap-4">
      <div class="grid grid-cols-4 gap-2">
        <!-- Předčíslí -->
        <div class="relative">
          <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Předčíslí
          </label>
          <input
            v-model="accountPrefix"
            type="text"
            @input="accountPrefix = accountPrefix.replace(/\D/g, '')"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            :class="{
              'border-red-500 dark:border-red-400': !isAccountLocked && accountPrefixError,
            }"
            placeholder="000000"
            :disabled="isAccountLocked"
          />
          <p
            v-if="!isAccountLocked && accountPrefixError"
            class="text-red-500 dark:text-red-400 text-sm mt-1 absolute"
          >
            {{ accountPrefixError }}
          </p>
        </div>

        <!-- Číslo účtu -->
        <div class="relative col-span-2">
          <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Číslo účtu
          </label>
          <input
            v-model="accountNumber"
            type="text"
            @input="handleAccountNumberInput($event.target.value)"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            :class="{
              'border-red-500 dark:border-red-400': !isAccountLocked && accountNumberError,
            }"
            placeholder="0000000000"
            :disabled="isAccountLocked"
          />
          <p
            v-if="!isAccountLocked && accountNumberError"
            class="text-red-500 dark:text-red-400 text-sm mt-1 absolute"
          >
            {{ accountNumberError }}
          </p>
        </div>

        <!-- Kód banky -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Kód banky
          </label>
          <select
            v-model="bankCode"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
          class="bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
        >
          Uložit do nastavení
        </button>
      </div>

      <div>
        <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          Částka (Kč)
        </label>
        <input
          v-model="amount"
          type="number"
          disabled
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
        />
      </div>

      <div>
        <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          Variabilní symbol
        </label>
        <input
          v-model="variableSymbol"
          type="text"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          @input="validateVariableSymbol"
        />
        <p v-if="variableSymbolError" class="text-red-500 dark:text-red-400 text-sm mt-1">
          {{ variableSymbolError }}
        </p>
      </div>

      <div>
        <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          Zpráva pro příjemce
        </label>
        <input
          v-model="message"
          type="text"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
  modelValue: {
    type: String,
    default: "",
  },
  paymentMessage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "update:modelValue",
  "update:accountNumber",
  "update:bankCode",
  "update:price",
  "update:paymentMessage",
]);

const accountPrefix = ref("");
const accountNumber = ref("");
const accountPrefixError = ref("");
const accountNumberError = ref("");
const bankCode = ref("3030");
const amount = ref(props.price);
const variableSymbol = ref(props.modelValue);
const message = ref(props.paymentMessage || props.concertTitle);
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

const validateAccountNumber = (value) => {
  if (!value) return true;
  // Povolíme čísla a pomlčku, ale musí být ve správném formátu
  const accountRegex = /^\d{0,6}-?\d{0,10}$/;
  return accountRegex.test(value.trim());
};

const validateBankCode = (value) => {
  if (!value) return true;
  // Bankovní kód musí být přesně 4 číslice
  const bankCodeRegex = /^\d{4}$/;
  return bankCodeRegex.test(value.trim());
};

const formatAccountNumber = (value) => {
  if (!value) return "";
  // Odstraníme všechny nečíselné znaky
  const numbers = value.replace(/\D/g, "");
  // Pokud je délka větší než 6, vložíme pomlčku
  if (numbers.length > 6) {
    return `${numbers.slice(0, 6)}-${numbers.slice(6)}`;
  }
  return numbers;
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
      validateAccountNumber(number);
    }
  } else {
    accountNumber.value = cleanValue;
    validateAccountNumber(cleanValue);
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
        // Zpracování IBAN formátu
        const accNum = data[mappedKey].accountNumber;
        // Pokud je číslo v IBAN formátu, extrahujeme samotné číslo účtu
        if (accNum.startsWith("CZ")) {
          accountNumber.value = accNum.slice(14); // Přeskočíme 'CZxx' + bank_code
        } else {
          accountNumber.value = accNum;
        }
        bankCode.value = data[mappedKey].bankCode;
        isAccountLocked.value = true;
      } else {
        accountNumber.value = "";
        bankCode.value = "0100";
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
  if (
    !validateAccountNumber(accountNumber.value) ||
    !validateBankCode(bankCode.value)
  ) {
    return;
  }

  try {
    const groupKey = props.selectedGroup.toLowerCase().replace(/\s+/g, "");
    const mappedKey = groupKey === "marikasingers" ? "marikaSingers" : groupKey;

    const currentSettings = await fetch("/api/settings").then((r) => r.json());

    // Vytvoření IBAN formátu pro uložení
    const cleanAccountNumber = accountNumber.value.replace(/\D/g, "");
    const paddedAccount = cleanAccountNumber.padStart(16, "0");
    const checkDigits = calculateIBANCheckDigits(bankCode.value, paddedAccount);
    const ibanFormat = `CZ${checkDigits}${bankCode.value}${paddedAccount}`;

    const updatedSettings = {
      ...currentSettings,
      [mappedKey]: {
        accountNumber: ibanFormat,
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
        !validateAccountNumber(newNumber) ||
        !validateBankCode(newBankCode) ||
        !validateVariableSymbol()
      ) {
        qrCodeData.value = "";
        return;
      }

      // Formát pro QR platbu (short payment descriptor)
      const cleanMessage = removeDiacritics(newMsg || "");
      const formattedAmount = Number(newAmount).toFixed(2);

      // Sestavíme kompletní číslo účtu a odstraníme nečíselné znaky
      const fullAccountNumber = (
        newPrefix ? newPrefix + newNumber : newNumber
      ).replace(/[^0-9]/g, "");

      // Vypočítáme kontrolní číslice a sestavíme IBAN
      const paddedAccount = fullAccountNumber.padStart(16, "0");
      const checkDigits = calculateIBANCheckDigits(newBankCode, paddedAccount);
      const numericVS = (newVS || "").replace(/\D/g, "");

      const qrData = `SPD*1.0*ACC:CZ${checkDigits}${newBankCode}${paddedAccount}*AM:${formattedAmount}*CC:CZK${
        numericVS ? "*X-VS:" + numericVS : ""
      }*MSG:${cleanMessage}`;

      qrCodeData.value = await toDataURL(qrData);

      // Emit updated values
      emit("update:modelValue", numericVS);
      emit("update:accountNumber", fullAccountNumber);
      emit("update:bankCode", newBankCode);
    } catch (err) {
      console.error("Chyba při generování QR kódu:", err);
      qrCodeData.value = "";
    }
  },
  { immediate: true }
);

// Sledování změny ceny z props
watch(
  () => props.price,
  (newPrice) => {
    amount.value = newPrice;
  },
  { immediate: true }
);

// Emitování změny částky zpět do parent komponenty
watch(amount, (newAmount) => {
  emit("update:price", Number(newAmount));
});

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

// Přidáme watch pro paymentMessage
watch(
  () => props.paymentMessage,
  (newMessage) => {
    if (newMessage) {
      message.value = removeDiacritics(newMessage);
    } else if (props.concertTitle) {
      message.value = removeDiacritics(props.concertTitle);
    }
  },
  { immediate: true }
);

// Sledování změny variabilního symbolu z props
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== variableSymbol.value) {
      variableSymbol.value = newValue;
    }
  },
  { immediate: true }
);

// Sledování změny lokálního variabilního symbolu
watch(variableSymbol, (newValue) => {
  if (newValue !== props.modelValue) {
    emit("update:modelValue", newValue);
  }
});

// Watch for changes in payment message
watch(message, (newMessage) => {
  emit("update:paymentMessage", newMessage);
});
</script>