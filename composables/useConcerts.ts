export const useConcerts = () => {
  const concerts = ref([
    {
      id: 1,
      title: "Praha",
      group: "MAS, Voices, Five",
      date: "Čtvrtek 7. července 2024",
      desc: "Marika Singers spolu s Voices a Five vystoupí v prostorách hotelu Academic v Roztokách!",
      image: "/images/article-image.png",
      price: "1000 Kč",
    },
    {
      id: 2,
      title: "České Budějovice",
      group: "Voices",
      date: "Pátek 12. září 2024",
      desc: "Pěti členné mužské uskupení vystoupí na Náplavce spolu s muzikanty.",
      image: "/images/article-image-2.png",
      price: "1000 Kč",
    },
    {
      id: 3,
      title: "Ústí nad Labem",
      group: "Five",
      date: "Sobota 16. listopadu 2024",
      desc: "Ženské vokální těleso Five vystoupí v Brně na Tržišti. Čekejte spousta české tvorby!",
      image: "/images/article-image-3.png",
      price: "1000 Kč",
    },
    {
      id: 4,
      title: "Praha",
      group: "MAS, Voices, Five",
      date: "Čtvrtek 7. července 2024",
      desc: "Marika Singers spolu s Voices a Five vystoupí v prostorách hotelu Academic v Roztokách!",
      image: "/images/article-image.png",
      price: "1000 Kč",
    },
    {
      id: 5,
      title: "České Budějovice",
      group: "Voices",
      date: "Pátek 12. září 2024",
      desc: "Pěti členné mužské uskupení vystoupí na Náplavce spolu s muzikanty.",
      image: "/images/article-image-2.png",
      price: "1000 Kč",
    },
    {
      id: 6,
      title: "Ústí nad Labem",
      group: "Five",
      date: "Sobota 16. listopadu 2024",
      desc: "Ženské vokální těleso Five vystoupí v Brně na Tržišti. Čekejte spousta české tvorby!",
      image: "/images/article-image-3.png",
      price: "1000 Kč",
    },
  ])

  return {
    concerts
  }
}