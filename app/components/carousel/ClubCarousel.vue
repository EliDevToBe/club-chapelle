<template>
  <div :class="ui.root">
    <UCarousel
      v-slot="{ item }"
      loop
      dots
      wheel-gestures
      :ui="{ container: 'ms-0', item: 'ps-0' }"
      :items="carouselItems"
      :autoplay="autoplayOptions"
    >
      <img
        v-if="isCarouselSlide(item)"
        :src="item.src"
        :alt="item.alt"
        width="1200"
        height="840"
        :class="ui.image"
        loading="lazy"
        decoding="async"
      />
    </UCarousel>
  </div>
</template>

<script setup lang="ts">
import { usePreferredReducedMotion } from "@vueuse/core";
import { usePublicWebsiteConfig } from "~/composables/usePublicWebsiteConfig";

const { publicCarouselConfigData } = usePublicWebsiteConfig();

const AUTOPLAY_DELAY_MS = 4500;

const prefersReducedMotion = usePreferredReducedMotion();

/** No autoplay when the visitor prefers reduced motion. */
const autoplayOptions = computed(() => {
  if (prefersReducedMotion.value === "reduce") {
    return false;
  }

  return { delay: AUTOPLAY_DELAY_MS };
});

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

/** Landscape placeholders (Unsplash License) until the Admin curates the club's own photos. */
const fallbackCarouselItems: CarouselSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1686445921828-d9c22e714f24?q=80&w=1600&auto=format&fit=crop",
    alt: "Archère en pleine visée sur un terrain de tir extérieur",
  },
  {
    src: "https://images.unsplash.com/photo-1634188091931-6cb1aa2752db?q=80&w=1600&auto=format&fit=crop",
    alt: "Archer à l'arc à poulies en pleine visée dans un jardin",
  },
  {
    src: "https://images.unsplash.com/photo-1681752987706-e7345626a5da?q=80&w=1600&auto=format&fit=crop",
    alt: "Trois cibles de tir à l'arc dans une salle",
  },
  {
    src: "https://images.unsplash.com/photo-1641531105535-1ead3c1784ab?q=80&w=1600&auto=format&fit=crop",
    alt: "Jeune archer visant une cible en extérieur",
  },
];

const ui = {
  root: "min-w-0",
  image: "aspect-[10/7] w-full object-cover",
};

const carouselItems = computed<CarouselSlide[]>(() => {
  const remoteItems = publicCarouselConfigData.value?.settings.data ?? [];
  if (remoteItems.length === 0) {
    return fallbackCarouselItems;
  }

  const parsedItems = remoteItems
    .map((item): CarouselSlide | null => {
      if (
        typeof item.url !== "string" ||
        item.url.trim().length === 0 ||
        typeof item.label !== "string" ||
        item.label.trim().length === 0
      ) {
        return null;
      }

      return {
        src: item.url,
        alt: item.label,
      };
    })
    .filter((item): item is CarouselSlide => {
      return item !== null;
    });

  if (parsedItems.length === 0) {
    return fallbackCarouselItems;
  }

  return parsedItems;
});
</script>

