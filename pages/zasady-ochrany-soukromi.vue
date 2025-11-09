<template>
  <div class="bg-white text-gray-800 mt-20">
    <section class="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-white py-20">
      <div class="absolute inset-0 opacity-50">
        <div
          class="h-full w-full bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.08),_transparent_55%)]"
        ></div>
      </div>

      <div class="relative mx-auto max-w-5xl px-6">
        <nav class="mb-8 flex items-center gap-2 text-sm text-rose-600">
          <NuxtLink to="/" class="hover:underline">Domů</NuxtLink>
          <span aria-hidden="true">/</span>
          <span class="font-medium text-rose-700">Zásady ochrany soukromí</span>
        </nav>

        <div class="rounded-3xl border border-rose-100 bg-white/80 p-10 shadow-xl backdrop-blur">
          <p class="mb-4 text-sm uppercase tracking-[0.45em] text-rose-500">
            Aktuální od {{ updatedAt }}
          </p>
          <h1 class="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
            Zásady ochrany soukromí a zpracování osobních údajů
          </h1>
          <p class="text-lg leading-relaxed text-gray-600 md:text-xl">
            Vážíme si důvěry, kterou nám projevujete, a proto transparentně popisujeme, jaké osobní
            údaje zpracováváme, za jakým účelem, jak je chráníme a jaká máte práva. Tyto zásady
            vycházejí z nařízení GDPR a souvisejících právních předpisů České republiky.
          </p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-5xl space-y-16 px-6 pb-24 pt-12 leading-relaxed">
      <article class="space-y-6 rounded-3xl border border-gray-100 bg-white p-10 shadow-sm">
        <h2 class="text-2xl font-semibold text-gray-900">1. Správce osobních údajů</h2>
        <p>
          Správcem osobních údajů je občanské sdružení
          <strong>Marika Singers, z. s.</strong>, se sídlem Bezručova 337, 25263 Roztoky. V případě
          dotazů nás kontaktujte na e-mailu
          <a :href="`mailto:${contactEmail}`" class="text-rose-600 underline decoration-rose-200 hover:decoration-rose-400">
            {{ contactEmail }}
          </a>.
        </p>
      </article>

      <article class="grid gap-8 rounded-3xl border border-gray-100 bg-white p-10 shadow-sm md:grid-cols-2">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">2. Jaké údaje zpracováváme</h2>
          <p>V závislosti na důvodu kontaktu můžeme zpracovávat zejména:</p>
        </div>
        <ul class="space-y-3 text-gray-600">
          <li>
            <strong class="text-gray-900">Identifikační údaje:</strong> jméno, příjmení.
          </li>
          <li>
            <strong class="text-gray-900">Kontaktní údaje:</strong> e-mail, telefon.
          </li>
          <li>
            <strong class="text-gray-900">Fakturační údaje:</strong> bankovní spojení.
          </li>
          <li>
            <strong class="text-gray-900">Obsah komunikace:</strong> zprávy zaslané pomocí formulářů
            nebo e-mailu.
          </li>
          <li>
            <strong class="text-gray-900">Technické údaje:</strong> cookies nezbytné pro chod webu a
            analytické cookies po udělení souhlasu.
          </li>
        </ul>
      </article>

      <article class="space-y-6 rounded-3xl border border-gray-100 bg-white p-10 shadow-sm">
        <h2 class="text-2xl font-semibold text-gray-900">3. Účely a právní důvody zpracování</h2>
        <div class="grid gap-6 md:grid-cols-2">
          <div class="rounded-2xl bg-rose-50 p-6">
            <h3 class="mb-2 text-lg font-semibold text-rose-700">Poskytnutí služby</h3>
            <p>
              Abychom mohli reagovat na vaše poptávky, organizovat koncerty nebo spolupráci, musíme
              zpracovávat vaše kontaktní údaje. Právním základem je plnění smlouvy nebo jednání před
              jejím uzavřením.
            </p>
          </div>
          <div class="rounded-2xl bg-rose-50 p-6">
            <h3 class="mb-2 text-lg font-semibold text-rose-700">Marketing a komunikace</h3>
            <p>
              V případě udělení souhlasu můžeme zasílat novinky o naší činnosti. Souhlas můžete kdykoli
              odvolat prostřednictvím odkazu v e-mailu nebo kontaktováním správce.
            </p>
          </div>
          <div class="rounded-2xl bg-rose-50 p-6">
            <h3 class="mb-2 text-lg font-semibold text-rose-700">Plnění právních povinností</h3>
            <p>
              Některé údaje uchováváme kvůli zákonným povinnostem, například kvůli účetnictví a
              daňovým předpisům.
            </p>
          </div>
          <div class="rounded-2xl bg-rose-50 p-6">
            <h3 class="mb-2 text-lg font-semibold text-rose-700">Legitimní zájem</h3>
            <p>
              Z důvodu ochrany našich práv můžeme uchovávat nezbytné informace, například záznamy o
              komunikaci nebo vyřešeních reklamací.
            </p>
          </div>
        </div>
      </article>

      <article class="space-y-6 rounded-3xl border border-gray-100 bg-white p-10 shadow-sm">
        <h2 class="text-2xl font-semibold text-gray-900">4. Cookies a analytika</h2>
        <p>
          Web využívá nezbytné cookies pro zajištění bezpečného fungování stránek. Analytické cookies
          aktivujeme pouze na základě vašeho souhlasu. Nastavení můžete kdykoli změnit v panelu
          „Nastavení cookies“ v pravém dolním rohu stránky.
        </p>
        <p>
          Pokud udělíte souhlas, používáme anonymizované měření návštěvnosti, které nám pomáhá zlepšovat
          obsah a nabídku služeb. Údaje nepropojujeme s vaší identitou.
        </p>
      </article>

      <article class="space-y-6 rounded-3xl border border-gray-100 bg-white p-10 shadow-sm">
        <h2 class="text-2xl font-semibold text-gray-900">5. Doba uchování údajů</h2>
        <ul class="space-y-3 text-gray-600">
          <li>
            Údaje související s poptávkou a smluvní agendou uchováváme po dobu spolupráce a následně
            <strong>maximálně 3 roky</strong> pro případné řešení sporů.
          </li>
          <li>
            Účetní doklady archivujeme dle zákonných povinností po dobu až <strong>10 let</strong>.
          </li>
          <li>Souhlas s marketingovou komunikací platí do jeho odvolání.</li>
          <li>Technické cookies jsou ukládány po dobu nezbytnou pro funkčnost webu.</li>
        </ul>
      </article>

      <article class="space-y-6 rounded-3xl border border-gray-100 bg-white p-10 shadow-sm">
        <h2 class="text-2xl font-semibold text-gray-900">6. Příjemci a zpracovatelé</h2>
        <p>
          K osobním údajům mohou mít přístup důvěryhodní partneři, kteří nám pomáhají s provozem webu
          nebo poskytováním služeb (např. poskytovatel hostingu, e-mailový marketing, účetní). S těmito
          partnery máme uzavřeny smlouvy o zpracování osobních údajů a dbáme na jejich bezpečnost.
        </p>
        <p>
          Osobní údaje nepředáváme mimo Evropskou unii s výjimkou nástrojů, které zajišťují odpovídající
          úroveň ochrany (např. standardní smluvní doložky).
        </p>
      </article>

      <article class="space-y-6 rounded-3xl border border-gray-100 bg-white p-10 shadow-sm">
        <h2 class="text-2xl font-semibold text-gray-900">7. Vaše práva</h2>
        <p>Máte právo na:</p>
        <ul class="space-y-3 text-gray-600">
          <li><strong>přístup</strong> k osobním údajům a získání kopie;</li>
          <li><strong>opravu</strong> nepřesných údajů nebo jejich doplnění;</li>
          <li><strong>výmaz</strong> údajů, které již nejsou potřebné;</li>
          <li><strong>omezení zpracování</strong> v odůvodněných případech;</li>
          <li><strong>přenositelnost</strong> údajů, které jste nám poskytli na základě souhlasu nebo smlouvy;</li>
          <li><strong>vzít zpět souhlas</strong> se zpracováním kdykoli, například odhlášením z newsletteru;</li>
          <li><strong>vznést námitku</strong> proti zpracování založenému na oprávněném zájmu.</li>
        </ul>
        <p>
          Pokud se domníváte, že s vašimi údaji zacházíme v rozporu s právními předpisy, můžete podat
          stížnost u <strong>Úřadu pro ochranu osobních údajů</strong> (www.uoou.cz).
        </p>
      </article>

      <article class="space-y-6 rounded-3xl border border-gray-100 bg-white p-10 shadow-sm">
        <h2 class="text-2xl font-semibold text-gray-900">8. Změny zásad</h2>
        <p>
          Tyto zásady můžeme občas aktualizovat, například z důvodu změn legislativy nebo poskytovaných
          služeb. Vždy uvedeme datum účinnosti a zásadní změny oznámíme vhodným způsobem na našem webu.
        </p>
      </article>

      <article class="space-y-4 rounded-3xl border border-rose-100 bg-rose-50/70 p-10 text-center shadow-sm">
        <h2 class="text-2xl font-semibold text-gray-900">Potřebujete upřesnit, jak pracujeme s údaji?</h2>
        <p class="text-gray-600">
          Napište nám na
          <a :href="`mailto:${contactEmail}`" class="text-rose-600 underline decoration-rose-200 hover:decoration-rose-400">
            {{ contactEmail }}
          </a>
          a rádi vám odpovíme.
        </p>
      </article>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  head: {
    title: "Zásady ochrany soukromí | Marika Singers",
    meta: [
      {
        name: "description",
        content:
          "Zjistěte, jak Marika Singers zpracovává osobní údaje, které údaje potřebuje a jak chrání vaše soukromí v souladu s GDPR.",
      },
    ],
  },
});

const updatedAt = "1. listopadu 2025";
const contactEmail = "info@marikasingers.cz";
</script>

