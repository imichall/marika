<template>
  <section id="testimonials" class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <div class="relative flex py-5 items-center">
        <div class="flex-grow border-t border-gray-400"></div>
        <span class="flex-shrink mx-4 text-black uppercase">Napsali o nás</span>
        <div class="flex-grow border-t border-gray-400"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="testimonial in testimonials"
          :key="testimonial.id"
          class="text-center p-6 border border-gray-200"
        >
          <p class="italic mb-4">{{ testimonial.text }}</p>
          <p class="font-bold">{{ testimonial.author }}</p>
          <p v-if="testimonial.source" class="text-sm text-gray-600">
            {{ testimonial.source }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const testimonials = [
  {
    id: 1,
    text: "Marika Singers jsou kulturním zážitkem. Chodím na ně pravidelně už 10 let a vždy mě něčím novým příjemně překvapí.",
    author: "Milan",
    source: false,
  },
  {
    id: 2,
    text: "To, co vás pohltí na koncertě tohoto tělesa je neskutečná, strhující energie. Profesionální podání od amaterů",
    author: "Český rozhlas",
    source: false,
  },
  {
    id: 3,
    text: "Řekl bych, že se jedná o jediný sbor v ČR, který nabízí velkou škálu žánrů od klasiky až po modernu. Rozhodně doporučuji.",
    author: "Česká televize",
    source: "Události v kultuře",
  },
  {
    id: 4,
    text: "Marika Singers jsou kulturním zážitkem. Chodím na ně pravidelně už 10 let a vždy mě něčím novým příjemně překvapí.",
    author: "MTV",
    source: false,
  },
  {
    id: 5,
    text: "To, co vás pohltí na koncertě tohoto tělesa je neskutečná, strhující energie. Profesionální podání od amaterů",
    author: "Óčko TV",
    source: false,
  },
  {
    id: 6,
    text: "To, co vás pohltí na koncertě tohoto tělesa je neskutečná, strhující energie. Profesionální podání od amaterů",
    author: "Óčko TV",
    source: false,
  },
];
</script>
