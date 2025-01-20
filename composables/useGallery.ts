import { ref } from "vue";

export const useGallery = () => {
  const galleryImages = ref([
    "mansory-00001.png",
    "mansory-00002.png",
    "mansory-00003.png",
    "mansory-00004.png",
    "mansory-00005.png",
    "mansory-00006.png",
    "mansory-00007.png",
    "mansory-00008.png",
    "mansory-00009.png",
    "mansory-00010.png",
  ]);

  return {
    galleryImages,
  };
};