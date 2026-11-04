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
                :class="[ui.image, card?.shiftingClass]"
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
import instagramThumbnail from "~/assets/instagram_thumbnail.webp";
import competitionThumbnail from "~/assets/competition_thumbnail.webp";
import heroClubLifeThumbnail from "~/assets/hero_clublife_thumbnail.webp";

type DiscoverCard = {
  label: string;
  to: string;
  image: string;
  shiftingClass?: string;
};

const { instagramUrl, facebookUrl } = await useSiteSettings();

/** Images are landscape placeholders (Unsplash License); all cards point to the club's social pages for now. */
const cards = computed<DiscoverCard[]>(() => {
  return [
    {
      label: "La vie du club",
      to: facebookUrl.value,
      image: heroClubLifeThumbnail,
    },
    {
      label: "Les concours",
      to: facebookUrl.value,
      image: competitionThumbnail,
      shiftingClass: "scale-200 origin-[95%_200px] group-hover:scale-[1.9]",
    },
    {
      label: "L'actu Instagram",
      to: instagramUrl.value,
      image: instagramThumbnail,
      shiftingClass: "object-[center_-42px]",
    },
  ];
});

const ui = {
  stack: "flex flex-col gap-10",
  grid: "grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-2.5 object",
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
