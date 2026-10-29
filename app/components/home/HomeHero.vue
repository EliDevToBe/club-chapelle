<template>
  <SiteSection tone="base" inner-class="pt-6 md:pt-10">
    <div :class="ui.grid">
      <div :class="ui.textColumn">
        <h1 :class="ui.title">
          <span class="block">Les Archers</span>
          <span class="block">de la</span>
          <span class="block">Chapelle</span>
        </h1>

        <TextContentSection
          :section-key="TEXT_SECTION_KEYS.homepageWelcome"
          hide-title
          :text-class="ui.welcome"
        />
      </div>

      <img
        :src="HERO_IMAGE.src"
        :alt="HERO_IMAGE.alt"
        width="900"
        height="1260"
        :class="ui.image"
        fetchpriority="high"
        decoding="async"
      />
    </div>
  </SiteSection>
</template>

<script setup lang="ts">
import SiteSection from "~/components/layout/SiteSection.vue";
import TextContentSection from "~/components/website/TextContentSection.vue";
import { TEXT_SECTION_KEYS } from "~~/shared/website/website-config.keys";

/** Portrait placeholder (Unsplash License) until the club provides its own hero photo. */
const HERO_IMAGE = {
  src: "https://images.unsplash.com/photo-1590585382453-8b749e9d5224?q=80&w=1200&auto=format&fit=crop",
  alt: "Archer bandant un arc traditionnel en extérieur",
};

const ui = {
  grid: "grid grid-cols-1 gap-10 md:grid-cols-6 md:gap-x-2.5",
  textColumn:
    "relative z-10 flex flex-col gap-10 md:col-span-3 md:row-start-1 md:gap-16 md:pt-20",
  title: [
    "font-serif font-light uppercase whitespace-nowrap text-primary-500",
    "text-[clamp(2.75rem,8.25vw,6.75rem)] leading-[0.875]",
  ],
  welcome: "text-primary font-medium md:max-w-md",
  image:
    "w-full aspect-[4/3] object-cover md:col-span-3 md:col-start-4 md:row-start-1 md:aspect-[5/7]",
};
</script>
