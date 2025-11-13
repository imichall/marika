<!-- Email Preview Component -->
<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
    <!-- Email náhled -->
    <div class="border-b border-gray-200 dark:border-gray-700 p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Náhled emailu</h2>
        <button
          @click="copyHtml"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <span>Kopírovat HTML</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>

      <!-- Email metadata -->
      <div class="space-y-2 mb-4">
        <div class="flex items-start">
          <span class="text-gray-500 dark:text-gray-400 w-20">Od:</span>
          <span class="text-gray-900 dark:text-gray-100">{{ from }}</span>
        </div>
        <div class="flex items-start">
          <span class="text-gray-500 dark:text-gray-400 w-20">Komu:</span>
          <span class="text-gray-900 dark:text-gray-100">{{ to }}</span>
        </div>
        <div class="flex items-start">
          <span class="text-gray-500 dark:text-gray-400 w-20">Předmět:</span>
          <span class="text-gray-900 dark:text-gray-100">{{ subject }}</span>
        </div>
      </div>
    </div>

    <!-- Email content -->
    <div class="p-4">
      <table
        ref="emailContent"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          font-family: Arial, sans-serif;
          color: #333333;
        "
      >
        <tbody>
          <tr>
            <td style="padding: 40px 20px; background-color: #f8f9fa">
              <!-- Logo -->
              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width: 100%; margin-bottom: 30px"
              >
                <tbody>
                  <tr>
                    <td align="center">
                      <img
                        src="https://marikasingers.cz/images/svg/marika-singers-logo.svg"
                        alt="Marika Singers Logo"
                        style="height: 60px; width: auto"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Content -->
              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  width: 100%;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                "
              >
                <tbody>
                  <tr>
                    <td style="padding: 30px">
                      <slot></slot>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Footer -->
              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="width: 100%; margin-top: 30px; text-align: center"
              >
                <tbody>
                  <tr>
                    <td
                      style="padding: 20px 0; color: #666666; font-size: 14px"
                    >
                      <p style="margin: 0 0 15px 0">
                        S pozdravem,<br />
                        Tým Marika Singers
                      </p>
                      <div
                        style="
                          margin: 25px 0;
                          padding-top: 20px;
                          border-top: 1px solid #eeeeee;
                        "
                      >
                        <p style="margin: 0 0 10px 0">
                          Sledujte nás na sociálních sítích:
                        </p>
                        <p style="margin: 0">
                          <a
                            href="https://facebook.com/marikasingers"
                            style="
                              color: #4267b2;
                              text-decoration: none;
                              margin: 0 8px;
                            "
                            >Facebook</a
                          >
                          <a
                            href="https://instagram.com/marikasingers"
                            style="
                              color: #e1306c;
                              text-decoration: none;
                              margin: 0 8px;
                            "
                            >Instagram</a
                          >
                        </p>
                      </div>
                      <p style="margin: 0; color: #999999; font-size: 12px">
                        © {{ new Date().getFullYear() }} Marika Singers. Všechna
                        práva vyhrazena.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "~/composables/useToast";

const props = defineProps({
  from: {
    type: String,
    default: "info@marikasingers.cz",
  },
  to: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
});

const emailContent = ref(null);
const toast = useToast();

const copyHtml = () => {
  if (emailContent.value) {
    const html = emailContent.value.outerHTML;
    navigator.clipboard
      .writeText(html)
      .then(() => {
        toast.success("HTML bylo zkopírováno do schránky");
      })
      .catch(() => {
        toast.error("Nepodařilo se zkopírovat HTML");
      });
  }
};
</script>