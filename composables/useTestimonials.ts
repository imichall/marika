import { ref } from "vue";

export const useTestimonials = () => {
  const testimonials = ref([
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
  ]);

  return {
    testimonials,
  };
};