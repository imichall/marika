<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white overflow-hidden relative"
  >
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="n in 20"
        :key="n"
        class="note absolute animate-float"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }"
      >
        ♪
      </div>
    </div>

    <div class="text-center px-4 relative">
      <!-- Animated microphone -->
      <div class="mb-8 relative mx-auto w-48 h-48">
        <svg
          class="w-full h-full animate-bounce-slow"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            class="animate-pulse"
            d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"
            fill="#991b1b"
          />
          <path
            d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
            stroke="#991b1b"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <div class="transform hover:scale-105 transition-transform duration-300">
        <h1 class="text-9xl font-bold text-red-800 mb-4 animate-pulse">
          4<span class="inline-block animate-bounce">0</span>4
        </h1>
        <p class="text-2xl text-gray-600 mb-4">Ups! Tady nic není...</p>
        <p class="text-xl text-gray-500 mb-8">
          Ale můžeme si zazpívat cestou zpět! 🎵
        </p>
      </div>

      <button
        @click="handleError"
        class="inline-flex items-center gap-2 px-8 py-4 bg-red-800 text-white rounded-full hover:bg-red-900 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <span class="text-lg">Zpět domů</span>
        <svg
          class="w-6 h-6 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  error: Object,
});

const handleError = () => {
  clearError({ redirect: "/" });
};
</script>

<style scoped>
.note {
  font-size: 2rem;
  color: #991b1b;
  opacity: 0.2;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>