<template>
  <section id="about" class="py-16 bg-white font-instrument">
    <div class="container mx-auto px-4">
      <div class="relative flex py-5 items-center">
        <div class="flex-grow border-t border-gray-400"></div>
        <span class="flex-shrink mx-4 text-black uppercase">O nás</span>
        <div class="flex-grow border-t border-gray-400"></div>
      </div>
      <div class="grid grid-cols-1 gap-12">
        <div
          v-for="group in groups"
          :key="group.id"
          class="text-center grid grid-cols-2 gap-14"
        >
          <div>
            <img
              :src="group.image"
              :alt="group.name"
              class="w-full h-full object-cover mb-4 border border-gray-200 p-2"
            />
          </div>
          <div class="grid grid-rows-[100px_auto_auto] justify-items-start">
            <h3 class="text-[36px] font-regular mb-2">{{ group.name }}</h3>
            <p class="text-gray-600 mb-4 text-left">{{ group.description }}</p>
            <button
              class="border border-black px-6 py-2 self-end uppercase inline-flex items-center gap-2 group hover:bg-black hover:text-white transition-all duration-300"
            >
              Poslechnout
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="transform transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const groups = [
  {
    id: 1,
    name: "Marika Singers",
    description:
      "Vokální seskupení, které můžete již více jak 15 let vídat na podiích jak u nás, tak v mnoha evropských zemích. Žánrová pestrost, vynikající přednes, skvělý hudební doprovod, efektní střídání sborových a sólových partů proložené vystoupením pánského i dámského kvinteta, ... to jsou vystoupení, která vás pohltí svojí energií, kde všichni zpívají a hrají jako o život a kde dirigenta více tančí, nežli diriguje. Kromě koncertních podií je lze slyšet i v pořadech České televize, Českého rozhlasu, TV Noe. Přijďte se přesvědčit  a sdílejte tuto atmosféru společně s námi.",
    image: "/images/about-1.png",
  },
  {
    id: 2,
    name: "Voices",
    description: "Mužské vokální uskupení v doprovodu skvělých muzikantů.",
    image: "/images/about-2.png",
  },
  {
    id: 3,
    name: "Five",
    description: "Ženské vokální uskupení v doprovodu skvělých muzikantů.",
    image: "/images/about-3.png",
  },
  // ... další skupiny
];
</script>
