<template>
  <div class="container mx-auto px-4 mt-[100px]">
    <!-- Breadcrumbs -->
    <AdminBreadcrumbs />

    <div class="mb-8">
      <h1
        class="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"
      >
        Systémová nastavení
      </h1>
    </div>

    <div class="bg-white rounded-xl shadow-lg p-6 space-y-8">
      <div>
        <h2 class="text-xl font-bold mb-4">Bankovní spojení</h2>
        <div class="grid grid-cols-1 gap-6">
          <!-- Marika Singers -->
          <div class="border rounded-lg p-4">
            <h3 class="font-bold mb-4">Marika Singers</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Předčíslí -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Předčíslí
                </label>
                <input
                  v-model="settings.marikaSingers.accountPrefix"
                  type="text"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="000000"
                />
              </div>
              <!-- Číslo účtu -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Číslo účtu
                </label>
                <input
                  v-model="settings.marikaSingers.accountNumber"
                  type="text"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0000000000"
                />
              </div>
              <!-- Kód banky -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Kód banky
                </label>
                <select
                  v-model="settings.marikaSingers.bankCode"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
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
          </div>

          <!-- Five -->
          <div class="border rounded-lg p-4">
            <h3 class="font-bold mb-4">Five</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Předčíslí -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Předčíslí
                </label>
                <input
                  v-model="settings.five.accountPrefix"
                  type="text"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="000000"
                />
              </div>
              <!-- Číslo účtu -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Číslo účtu
                </label>
                <input
                  v-model="settings.five.accountNumber"
                  type="text"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0000000000"
                />
              </div>
              <!-- Kód banky -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Kód banky
                </label>
                <select
                  v-model="settings.five.bankCode"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
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
          </div>

          <!-- Voices -->
          <div class="border rounded-lg p-4">
            <h3 class="font-bold mb-4">Voices</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Předčíslí -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Předčíslí
                </label>
                <input
                  v-model="settings.voices.accountPrefix"
                  type="text"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="000000"
                />
              </div>
              <!-- Číslo účtu -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Číslo účtu
                </label>
                <input
                  v-model="settings.voices.accountNumber"
                  type="text"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0000000000"
                />
              </div>
              <!-- Kód banky -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Kód banky
                </label>
                <select
                  v-model="settings.voices.bankCode"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
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
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          @click="saveSettings"
          class="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5"
          :disabled="loading"
        >
          {{ loading ? "Ukládám..." : "Uložit nastavení" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "~/composables/useToast";

const toast = useToast();
const loading = ref(false);

const settings = ref({
  marikaSingers: {
    accountPrefix: "",
    accountNumber: "",
    bankCode: "3030",
  },
  five: {
    accountPrefix: "",
    accountNumber: "",
    bankCode: "3030",
  },
  voices: {
    accountPrefix: "",
    accountNumber: "",
    bankCode: "3030",
  },
});

const validateSettings = () => {
  const validateAccount = (prefix, number) => {
    if (prefix && (!/^\d+$/.test(prefix) || prefix.length > 6)) {
      return false;
    }
    if (
      !number ||
      !/^\d+$/.test(number) ||
      number.length < 2 ||
      number.length > 10
    ) {
      return false;
    }
    return true;
  };

  for (const group of Object.values(settings.value)) {
    if (!validateAccount(group.accountPrefix, group.accountNumber)) {
      return false;
    }
  }
  return true;
};

const fetchSettings = async () => {
  loading.value = true;
  try {
    const response = await fetch("/api/settings");
    if (response.ok) {
      const data = await response.json();
      if (data) {
        // Převedeme data do nového formátu
        Object.keys(settings.value).forEach((key) => {
          if (data[key]) {
            const parts = data[key].accountNumber.split("-");
            if (parts.length === 2) {
              settings.value[key].accountPrefix = parts[0];
              settings.value[key].accountNumber = parts[1];
            } else {
              settings.value[key].accountPrefix = "";
              settings.value[key].accountNumber = data[key].accountNumber;
            }
            settings.value[key].bankCode = data[key].bankCode;
          }
        });
      }
    }
  } catch (err) {
    console.error("Error fetching settings:", err);
    toast.error("Nepodařilo se načíst nastavení");
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  if (!validateSettings()) {
    toast.error("Zkontrolujte prosím správnost zadaných údajů");
    return;
  }

  loading.value = true;
  try {
    // Převedeme data do formátu pro API
    const apiData = {};
    Object.entries(settings.value).forEach(([key, value]) => {
      apiData[key] = {
        accountNumber: value.accountPrefix
          ? `${value.accountPrefix}-${value.accountNumber}`
          : value.accountNumber,
        bankCode: value.bankCode,
      };
    });

    const response = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    });

    if (response.ok) {
      toast.success("Nastavení bylo úspěšně uloženo");
      await fetchSettings(); // Znovu načteme data po uložení
    } else {
      throw new Error("Failed to save settings");
    }
  } catch (err) {
    console.error("Error saving settings:", err);
    toast.error("Nepodařilo se uložit nastavení");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSettings();
});

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});
</script>