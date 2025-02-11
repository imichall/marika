<template>
  <section id="about" class="pb-16 bg-white font-instrument">
    <div class="container mx-auto px-4">
      <div class="relative flex py-10 items-center">
        <div class="flex-grow border-t border-gray-400"></div>
        <span class="flex-shrink mx-4 text-2xl text-black uppercase"
          >O nás</span
        >
        <div class="flex-grow border-t border-gray-400"></div>
      </div>
      <div v-if="loading" class="text-center py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"
        ></div>
      </div>
      <div v-else-if="error" class="text-center text-red-600 py-8">
        {{ error }}
      </div>
      <div v-else class="grid grid-cols-1 gap-12">
        <div
          v-for="group in groups"
          :key="group.id"
          class="text-center grid grid-cols-1 md:grid-cols-2 gap-14"
        >
          <div>
            <img
              :src="group.image"
              :alt="group.name"
              class="w-full h-full object-cover mb-4 border border-gray-200 p-2"
            />
          </div>
          <div class="grid grid-rows-[50px_auto_auto] justify-items-start">
            <h3 class="text-[36px] font-regular mb-2">{{ group.name }}</h3>
            <div
              v-if="getSocialMediaForGroup(group.id).length"
              class="flex gap-3 mb-4"
            >
              <a
                v-for="social in getSocialMediaForGroup(group.id)"
                :key="social.id"
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                :class="[
                  'hover:opacity-80 transition-opacity',
                  getPlatformColor(social.platform),
                ]"
                :title="social.platform"
              >
                <svg class="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    :d="getPlatformIcon(social.platform)"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
            <p class="text-gray-600 mb-4 text-left">{{ group.description }}</p>
            <a
              v-if="
                group.button_link &&
                group.button_link !== 'null' &&
                group.button_link !== null
              "
              :href="group.button_link"
              target="_blank"
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
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from "vue";
import { useChoirGroups } from "~/composables/useChoirGroups";
import { useSocialMedia } from "~/composables/useSocialMedia";

const { groups, loading, error, fetchGroups } = useChoirGroups();
const { socialMedia, fetchSocialMedia } = useSocialMedia();

const getSocialMediaForGroup = (groupId) => {
  if (!socialMedia.value) return [];
  return socialMedia.value.filter((item) => item.choir_group_id === groupId);
};

const getPlatformIcon = (platform) => {
  switch (platform.toLowerCase()) {
    case "facebook":
      return "M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z";
    case "instagram":
      return "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z";
    case "youtube":
      return "M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9c.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83c-.25.9-.83 1.48-1.73 1.73c-.47.13-1.33.22-2.65.28c-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44c-.9-.25-1.48-.83-1.73-1.73c-.13-.47-.22-1.1-.28-1.9c-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83c.25-.9.83-1.48 1.73-1.73c.47-.13 1.33-.22 2.65-.28c1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44c.9.25 1.48.83 1.73 1.73Z";
    case "spotify":
      return "M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6c-.15-.5.15-1 .6-1.15c3.55-1.05 9.4-.85 13.1 1.35c.45.25.6.85.35 1.3c-.25.35-.85.5-1.3.25m-.1 2.8c-.25.35-.7.5-1.05.25c-2.7-1.65-6.8-2.15-9.95-1.15c-.4.1-.85-.1-.95-.5c-.1-.4.1-.85.5-.95c3.65-1.1 8.15-.55 11.25 1.35c.35.15.4.55.25.85M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2Z";
    default:
      return "";
  }
};

const getPlatformColor = (platform) => {
  const colors = {
    facebook: "text-[#1877F2]",
    instagram: "text-[#E4405F]",
    youtube: "text-[#FF0000]",
    spotify: "text-[#1DB954]",
  };
  return colors[platform.toLowerCase()] || "text-gray-600";
};

onMounted(async () => {
  await Promise.all([fetchGroups(), fetchSocialMedia()]);
});
</script>