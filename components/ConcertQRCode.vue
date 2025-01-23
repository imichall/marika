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
import { ref, computed, onMounted } from "vue";
import QRCodeVue3 from "qrcode-vue3";

const props = defineProps({
  qrSession: {
    type: String,
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
  if (!props.qrSession) return null;
  try {
    const decodedData = JSON.parse(atob(props.qrSession));
    // Přidáme další informace pro QR kód
    return JSON.stringify({
      ...decodedData,
      type: "concert_ticket",
    });
  } catch (err) {
    console.error("Error decoding QR session:", err);
    return null;
  }
});
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