<template>
  <div v-if="qrData" class="qr-code">
    <QRCodeVue3
      :value="qrData"
      :size="size"
      level="H"
      :background="background"
      :foreground="foreground"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import QRCodeVue3 from "qrcode-vue3";

const props = defineProps({
  concert: {
    type: Object,
    required: true,
  },
  ticketCount: {
    type: Number,
    required: true,
  },
  size: {
    type: Number,
    default: 200,
  },
  background: {
    type: String,
    default: "#ffffff",
  },
  foreground: {
    type: String,
    default: "#000000",
  },
});

const bankDetails = ref({
  accountNumber: "",
  bankCode: "",
});

const qrData = ref(null);

// Načtení bankovních údajů
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
          generateQRCode();
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
    generateQRCode();
  } catch (err) {
    console.error("Error loading bank details:", err);
    qrData.value = null;
  }
};

// Funkce pro výpočet IBAN a kontrolních číslic
const calculateIBAN = (accountNumber, bankCode) => {
  // Odstraníme nečíselné znaky a doplníme nulami na 16 míst
  const cleanAccount = accountNumber.replace(/\D/g, "").replace(/^0+/, ""); // Odstraníme přední nuly
  const paddedAccount = cleanAccount.padStart(16, "0");

  // Sestavíme řetězec pro výpočet: bankCode + accountNumber + "CZ00"
  const base = `${bankCode}${paddedAccount}123500`;

  // Výpočet modulo 97
  let remainder = 0;
  for (let i = 0; i < base.length; i++) {
    remainder = (remainder * 10 + parseInt(base.charAt(i))) % 97;
  }

  // Výpočet kontrolních číslic
  const checkDigits = String(98 - remainder).padStart(2, "0");

  return {
    checkDigits,
    paddedAccount,
  };
};

// Generování QR kódu
const generateQRCode = () => {
  if (
    !props.concert.group_name ||
    !props.concert.price ||
    !props.ticketCount ||
    !bankDetails.value.accountNumber ||
    !bankDetails.value.bankCode
  ) {
    qrData.value = null;
    return;
  }

  try {
    // Příprava dat pro QR kód
    const message = removeDiacritics(props.concert.title);
    const amount = (props.concert.price * props.ticketCount).toFixed(2);

    // Výpočet IBAN
    const { checkDigits, paddedAccount } = calculateIBAN(
      bankDetails.value.accountNumber,
      bankDetails.value.bankCode
    );

    // Sestavení základního QR řetězce
    let qrString = `SPD*1.0*ACC:CZ${checkDigits}${bankDetails.value.bankCode}${paddedAccount}*AM:${amount}*CC:CZK`;

    // Přidání variabilního symbolu pouze pokud je vyplněn a není samé nuly
    if (props.concert.variable_symbol && props.concert.variable_symbol.trim()) {
      const variableSymbol = props.concert.variable_symbol
        .replace(/\D/g, "")
        .replace(/^0+/, ""); // Odstraníme přední nuly
      if (variableSymbol) {
        // Přidáme VS pouze pokud po odstranění nul něco zbylo
        qrString += `*X-VS:${variableSymbol.padStart(10, "0")}`;
      }
    }

    // Přidání zprávy
    qrString += `*MSG:${message}`;

    qrData.value = qrString;
  } catch (err) {
    console.error("Error generating QR code:", err);
    qrData.value = null;
  }
};

// Sledování změn pro přegenerování QR kódu
watch(
  [() => props.concert, () => props.ticketCount, bankDetails],
  () => {
    generateQRCode();
  },
  { deep: true }
);

// Inicializace
onMounted(() => {
  loadBankDetails();
});

const removeDiacritics = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};
</script>

<style scoped>
.qr-code {
  display: inline-block;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>