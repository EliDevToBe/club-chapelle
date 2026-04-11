<template>
  <section
    aria-labelledby="landing-photos-title"
    class="space-y-3 md:space-y-4"
  >
    <h2
      id="landing-photos-title"
      class="text-lg font-semibold text-highlighted md:text-xl"
    >
      Quelques images
    </h2>
    <UCarousel
      v-slot="{ item }"
      loop
      arrows
      dots
      wheel-gestures
      class="w-full min-w-0"
      :items="carouselItems"
      :autoplay="{ delay: 4500 }"
      :prev="{ color: 'neutral', variant: 'solid' }"
      :next="{ color: 'neutral', variant: 'solid' }"
      :ui="{
        item: 'basis-full min-w-0 ps-0 shrink-0',
        container: 'ms-0',
      }"
    >
      <img
        v-if="isCarouselSlide(item)"
        :src="item.src"
        :alt="item.alt"
        width="1200"
        height="675"
        class="aspect-video w-full rounded-lg object-contain"
        loading="lazy"
        decoding="async"
      />
    </UCarousel>
  </section>
</template>

<script setup lang="ts">
type CarouselSlide = {
  src: string;
  alt: string;
};

const isCarouselSlide = (value: unknown): value is CarouselSlide => {
  return (
    typeof value === "object" &&
    value !== null &&
    "src" in value &&
    "alt" in value &&
    typeof (value as CarouselSlide).src === "string" &&
    typeof (value as CarouselSlide).alt === "string"
  );
};

const { public: pub } = useRuntimeConfig();

const socialInstagram = computed(() => pub.socialInstagram);
const socialFacebook = computed(() => pub.socialFacebook);

const carouselItems: CarouselSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1686445921828-d9c22e714f24?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Archer tenant un arc classique en extérieur",
  },
  {
    src: "https://plus.unsplash.com/premium_photo-1718315735010-a382235a28b7?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Cible de tir à l’arc avec flèches",
  },
  {
    src: "https://images.unsplash.com/photo-1590585382453-8b749e9d5224?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Archer traditionnel tenant un arc",
  },
  {
    src: "https://images.unsplash.com/photo-1510925758641-869d353cecc7?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Archer visant à l'extérieur",
  },
];
</script>

<style scoped lang=""></style>
