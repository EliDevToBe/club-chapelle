<template>
  <SiteSection id="philosophie" tone="base">
    <div :class="ui.grid">
      <TextContentSection
        :section-key="TEXT_SECTION_KEYS.clubPhilosophy"
        is-main-section
        muted
        text-class="italic"
        :class="ui.text"
      />

      <ClubCarousel :class="ui.carousel" />
    </div>
  </SiteSection>
</template>

<script setup lang="ts">
import ClubCarousel from "~/components/carousel/ClubCarousel.vue";
import SiteSection from "~/components/layout/SiteSection.vue";
import TextContentSection from "~/components/website/TextContentSection.vue";
import { TEXT_SECTION_KEYS } from "~~/shared/website/website-config.keys";

const ui = {
  grid: "grid grid-cols-1 gap-y-14 md:grid-cols-6 md:gap-x-2.5",
  text: "md:col-span-3 md:pr-10",
  carousel: "md:col-span-3 md:col-start-4 md:bleed-right pb-8",
};
</script>
