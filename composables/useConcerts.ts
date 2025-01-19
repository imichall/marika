import { ref } from "vue";

export const useConcerts = () => {
  const concerts = ref([
    {
      id: 1,
      title: "Vánoční koncert",
      date: "2024-12-24",
      desc: "Tradiční vánoční koncert v kostele sv. Mikuláše",
      group: "Marika Singers",
      price: 250,
      image: "/images/concerts/concert-1.jpg",
    },
    {
      id: 2,
      title: "Jarní koncert",
      date: "2024-03-21",
      desc: "Uvítání jara s Voices",
      group: "Voices",
      price: 200,
      image: "/images/concerts/concert-2.jpg",
    },
    {
      id: 3,
      title: "Letní open-air",
      date: "2024-07-15",
      desc: "Koncert pod širým nebem s Five",
      group: "Five",
      price: 300,
      image: "/images/concerts/concert-3.jpg",
    },
  ]);

  const addConcert = (concert) => {
    concerts.value.push({
      id: Date.now(),
      ...concert,
    });
  };

  const updateConcert = (id, updatedConcert) => {
    const index = concerts.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      concerts.value[index] = {
        ...concerts.value[index],
        ...updatedConcert,
      };
    }
  };

  const deleteConcert = (id) => {
    const index = concerts.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      concerts.value.splice(index, 1);
    }
  };

  return {
    concerts,
    addConcert,
    updateConcert,
    deleteConcert,
  };
};