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
import { ref, computed } from "vue";
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

const qrData = computed(() => {
  if (!props.concert.account_number || !props.concert.bank_code) return null;

  try {
    // Formát pro QR platbu (short payment descriptor)
    const cleanMessage = removeDiacritics(props.concert.title);
    const totalAmount = (props.concert.price * props.ticketCount).toFixed(2);

    // Sestavíme kompletní číslo účtu a doplníme nulami na 16 míst
    const paddedAccount = props.concert.account_number.padStart(16, "0");

    // Vypočítáme kontrolní číslice
    const checkDigits = calculateIBANCheckDigits(
      props.concert.bank_code,
      paddedAccount
    );

    // Sestavíme QR kód
    const qrString = `SPD*1.0*ACC:CZ${checkDigits}${props.concert.bank_code}${paddedAccount}*AM:${totalAmount}*CC:CZK*MSG:${cleanMessage}`;

    console.log("Generated QR string:", qrString);
    return qrString;
  } catch (err) {
    console.error("Error generating QR code:", err);
    return null;
  }
});

// Funkce pro výpočet kontrolních číslic IBAN
const calculateIBANCheckDigits = (bankCode, accountNumber) => {
  try {
    // Sestavíme řetězec pro výpočet: bankCode + accountNumber + CZ + 00
    const base = `${bankCode}${accountNumber}1235${"00"}`;

    // Počítáme modulo
    let remainder = 0;
    for (let i = 0; i < base.length; i++) {
      remainder = (remainder * 10 + parseInt(base.charAt(i))) % 97;
    }

    // Vypočítáme kontrolní číslice
    return String(98 - remainder).padStart(2, "0");
  } catch (err) {
    console.error("Error calculating IBAN check digits:", err);
    return "00";
  }
};

// Funkce pro odstranění diakritiky
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