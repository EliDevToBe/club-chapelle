<template>
  <SiteSection tone="muted">
    <div :class="ui.stack">
      <h2 :class="MAIN_SECTION_TITLE">Découvrir</h2>

      <ul :class="ui.grid">
        <li v-for="card in cards" :key="card.label">
          <a
            :href="card.to"
            target="_blank"
            rel="noopener noreferrer"
            :class="ui.card"
          >
            <span :class="ui.imageFrame">
              <img
                :src="card.image"
                alt=""
                width="900"
                height="600"
                :class="ui.image"
                loading="lazy"
                decoding="async"
              />
            </span>
            <span :class="ui.label">
              {{ card.label }}
              <span class="sr-only">(nouvel onglet)</span>
            </span>
          </a>
        </li>
      </ul>
    </div>
  </SiteSection>
</template>

<script setup lang="ts">
import SiteSection from "~/components/layout/SiteSection.vue";
import { MAIN_SECTION_TITLE } from "~/components/ui/style";
import { useSiteSettings } from "~/composables/useSiteSettings";

type DiscoverCard = {
  label: string;
  to: string;
  image: string;
};

const { instagramUrl, facebookUrl } = await useSiteSettings();

/** Images are landscape placeholders (Unsplash License); all cards point to the club's social pages for now. */
const cards = computed<DiscoverCard[]>(() => {
  return [
    {
      label: "La vie du club",
      to: facebookUrl.value,
      image:
        "https://images.unsplash.com/photo-1693581132302-17886bf4e3f1?q=80&w=1200&auto=format&fit=crop",
    },
    {
      label: "Les concours",
      to: facebookUrl.value,
      image:
        "https://images.unsplash.com/photo-1776847651583-1d804b5cc339?q=80&w=1200&auto=format&fit=crop",
    },
    {
      label: "L'actu Instagram",
      to: instagramUrl.value,
      image:
        "https://images.unsplash.com/photo-1658314756005-eace6f871a44?q=80&w=1200&auto=format&fit=crop",
    },
  ];
});

const ui = {
  stack: "flex flex-col gap-10",
  grid: "grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-2.5",
  card: "group flex flex-col gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
  imageFrame: "block overflow-hidden",
  image:
    "aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105",
  label: [
    "px-2 font-label font-bold uppercase leading-tight text-primary-500",
    "text-2xl lg:text-3xl group-hover:underline underline-offset-6 decoration-2",
  ],
};
</script>
