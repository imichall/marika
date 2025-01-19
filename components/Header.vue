<template>
  <header class="relative h-[60vh] bg-black mt-[5.5rem]">
    <div class="absolute inset-0">
      <video
        autoplay
        muted
        loop
        playsinline
        class="w-full h-full object-cover opacity-70"
      >
        <source src="/video/hero-video.mp4" type="video/mp4" />
        <!-- Fallback pro případ, že video nelze přehrát -->
        <img
          src="/images/hero.jpg"
          alt="Marika Singers"
          class="w-full h-full object-cover opacity-70"
        />
      </video>
    </div>
    <div
      class="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-white text-center gap-4"
    >
      <h1 class="text-5xl font-bold">MARIKA SINGERS</h1>
      <h2 class="text-xl mb-2">
        Vokální skupina,<br />kterou musíte nejen slyšet, ale i vidět
      </h2>
    </div>
  </header>
</template>