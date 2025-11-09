<template>
  <ClientOnly>
    <transition name="consent-slide-up">
      <section
        v-if="visible"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        class="consent-sheet"
      >
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
          <div class="flex-1 space-y-3">
            <h2 id="consent-title" class="text-lg font-semibold tracking-tight md:text-xl">
              Záleží nám na vašem soukromí
            </h2>
            <p class="consent-description">
              Používáme pouze nezbytné soubory cookie pro bezpečný provoz webu. Po vašem souhlasu
              můžeme povolit také anonymní měření návštěvnosti, které nám pomáhá vylepšovat služby.
              Více se dozvíte v dokumentu
              <NuxtLink :to="privacyPolicyUrl" class="consent-link">
                Zásady ochrany soukromí
              </NuxtLink>
              .
            </p>
          </div>

          <div class="flex flex-col gap-3 text-sm md:w-60">
            <fieldset class="consent-fieldset">
              <legend class="consent-legend">
                Preferovaná nastavení
              </legend>
              <label class="consent-checkbox" aria-disabled="true">
                <input type="checkbox" checked disabled />
                <span>
                  <strong>Nezbytné</strong>
                  <small>Zajišťují bezpečný chod webu a nelze je vypnout.</small>
                </span>
              </label>
              <label class="consent-checkbox">
                <input
                  id="consent-analytics"
                  type="checkbox"
                  :checked="preferences.analytics"
                  @change="toggleAnalytics"
                />
                <span>
                  <strong>Analytické</strong>
                  <small>Anonymní měření návštěvnosti a výkonu.</small>
                </span>
              </label>
            </fieldset>
        </div>
    </div>
    <div class="consent-actions">
      <button class="consent-btn secondary" type="button" @click="acceptNecessary">
        Pouze nezbytné
      </button>
      <button class="consent-btn primary" type="button" @click="acceptAll">
        Přijmout vše
      </button>
    </div>
      </section>
    </transition>

    <button v-if="!visible && hasDecision" type="button" class="consent-trigger" @click="reopen">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="cookie-icon"
      >
        <path
          d="M21 12.79A9 9 0 1111.21 3a2.5 2.5 0 003.29 3.29A2.5 2.5 0 0018.5 9.5 2.5 2.5 0 0021 12.79z"
        />
        <path d="M8 12v.01" />
        <path d="M12 17v.01" />
        <path d="M12 13v.01" />
        <path d="M16 15v.01" />
      </svg>
      <span class="sr-only">Nastavení cookies</span>
    </button>
  </ClientOnly>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRuntimeConfig, useState } from "#imports";

const CONSENT_STORAGE_KEY = "marika-cookie-consent";
const runtimeConfig = useRuntimeConfig();
const privacyPolicyUrl =
  runtimeConfig.public?.privacyPolicyUrl || "/zasady-ochrany-soukromi";

const visible = ref(false);
const hasDecision = ref(false);
const preferences = useState("cookie-preferences", () => ({
  necessary: true,
  analytics: false,
  timestamp: null,
}));

const persistPreferences = () => {
  if (typeof window === "undefined") return;

  const payload = {
    necessary: true,
    analytics: preferences.value.analytics === true,
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
  preferences.value = payload;
  hasDecision.value = true;

  window.dispatchEvent(
    new CustomEvent("cookie-consent-change", {
      detail: payload,
    }),
  );

  window.dispatchEvent(
    new CustomEvent(
      payload.analytics ? "analytics-consent-granted" : "analytics-consent-revoked",
      { detail: payload },
    ),
  );
};

const acceptAll = () => {
  preferences.value.analytics = true;
  persistPreferences();
  visible.value = false;
};

const acceptNecessary = () => {
  preferences.value.analytics = false;
  persistPreferences();
  visible.value = false;
};

const toggleAnalytics = (event) => {
  preferences.value.analytics = event.target.checked;
};

const reopen = () => {
  visible.value = true;
};

onMounted(() => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const storedValue = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (storedValue) {
      const parsed = JSON.parse(storedValue);
      const payload = {
        necessary: true,
        analytics: parsed.analytics === true,
        timestamp: parsed.timestamp || new Date().toISOString(),
      };

      preferences.value = payload;
      hasDecision.value = true;
      visible.value = false;

      window.dispatchEvent(
        new CustomEvent("cookie-consent-change", {
          detail: payload,
        }),
      );

      if (payload.analytics) {
        window.dispatchEvent(new CustomEvent("analytics-consent-granted", { detail: payload }));
      }

      return;
    }
  } catch (error) {
    console.warn("[ConsentManager] Failed to read stored consent", error);
  }

  visible.value = true;
});
</script>

<style scoped>
.consent-sheet {
  position: fixed;
  inset: auto 1rem 1rem;
  z-index: 50;
  margin: 0 auto;
  max-width: 900px;
  border-radius: 28px;
  border: 1px solid rgba(185, 28, 28, 0.15);
  padding: 1.75rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 247, 247, 0.9));
  box-shadow: 0 32px 60px -28px rgba(185, 28, 28, 0.4), 0 18px 40px -24px rgba(15, 23, 42, 0.25);
  backdrop-filter: blur(18px);
  color: rgb(31 41 55);
}

@media (min-width: 768px) {
  .consent-sheet {
    inset-inline: 2rem;
    padding: 2.25rem;
  }
}

@media (prefers-color-scheme: dark) {
  .consent-sheet {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(255, 236, 236, 0.9));
    border-color: rgba(255, 255, 255, 0.35);
    color: rgb(15 23 42);
  }
}

.consent-description {
  font-size: 0.95rem;
  line-height: 1.65;
  color: rgb(71 85 105);
}

.consent-link {
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: rgba(185, 28, 28, 0.35);
  color: rgb(202 35 35);
}

.consent-link:hover {
  text-decoration-color: rgba(185, 28, 28, 0.75);
  color: rgb(190 18 18);
}

.consent-fieldset {
  border: 1px solid rgba(185, 28, 28, 0.2);
  border-radius: 22px;
  padding: 1.15rem;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

@media (prefers-color-scheme: dark) {
  .consent-fieldset {
    background: rgba(255, 255, 255, 0.92);
    border-color: rgba(185, 28, 28, 0.32);
  }
}

.consent-legend {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.75rem;
  margin-inline: auto 0;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 700;
  color: rgba(185, 28, 28, 0.78);
}

.consent-checkbox {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.75rem 0.5rem;
  border-radius: 0.75rem;
  transition: background-color 0.2s ease, color 0.2s ease;
  background: transparent;
}

.consent-checkbox input {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  accent-color: rgb(185 28 28);
}

.consent-checkbox span strong {
  display: block;
  color: rgb(30 41 59);
  font-size: 0.95rem;
}

.consent-checkbox span small {
  display: block;
  margin-top: 0.15rem;
  color: rgb(100 116 139);
  line-height: 1.3;
  font-size: 0.85rem;
}

.consent-checkbox:hover,
.consent-checkbox:focus-within {
  background: rgba(185, 28, 28, 0.08);
}

.consent-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.consent-btn {
  min-width: 168px;
  border-radius: 9999px;
  padding: 0.55rem 1.1rem;
  font-weight: 600;
  font-size: 0.95rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.consent-btn.primary {
  background: linear-gradient(135deg, rgb(220 38 38), rgb(185 28 28));
  color: white;
  box-shadow: 0 20px 35px -18px rgba(220, 38, 38, 0.65);
}

.consent-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 32px 40px -18px rgba(220, 38, 38, 0.55);
}

.consent-btn.secondary {
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: rgba(255, 255, 255, 0.95);
  color: rgb(71 85 105);
  box-shadow: 0 14px 18px -16px rgba(148, 163, 184, 0.6);
}

.consent-btn.secondary:hover {
  background-color: rgba(248, 250, 252, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 18px 22px -18px rgba(148, 163, 184, 0.6);
}

.consent-slide-up-enter-active,
.consent-slide-up-leave-active {
  transition: opacity 0.2s ease, transform 0.3s ease;
}

.consent-slide-up-enter-from,
.consent-slide-up-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

.consent-trigger {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  border: 1px solid rgba(185, 28, 28, 0.25);
  padding: 0;
  background: rgba(255, 255, 255, 0.9);
  color: rgb(185 28 28);
  box-shadow: 0 18px 24px -20px rgba(220, 38, 38, 0.6);
  backdrop-filter: blur(14px);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.consent-trigger:hover {
  background: rgba(255, 255, 255, 0.98);
  transform: translateY(-2px);
  box-shadow: 0 22px 28px -18px rgba(220, 38, 38, 0.5);
}

.consent-trigger .cookie-icon {
  width: 1.5rem;
  height: 1.5rem;
}
</style>

