<template>
  <SiteSection id="informations" tone="muted">
    <div :class="ui.grid">
      <div :class="ui.mainColumn">
        <TextContentSection
          :section-key="TEXT_SECTION_KEYS.infosIntroduction"
          is-main-section
          muted
        />

        <TarifsSection />
      </div>

      <div :class="ui.scheduleBox">
        <OpeningHoursSection />
      </div>
    </div>
  </SiteSection>
</template>

<script setup lang="ts">
import SiteSection from "~/components/layout/SiteSection.vue";
import OpeningHoursSection from "~/components/opening-hours/OpeningHoursSection.vue";
import TarifsSection from "~/components/tarifs/TarifsSection.vue";
import TextContentSection from "~/components/website/TextContentSection.vue";
import { TEXT_SECTION_KEYS } from "~~/shared/website/website-config.keys";

const ui = {
  grid: "grid grid-cols-1 gap-12 lg:grid-cols-6 lg:gap-x-2.5",
  mainColumn: "flex flex-col gap-12 lg:col-span-3 lg:pr-10",
  scheduleBox:
    "border-2 border-default p-6 sm:p-10 lg:col-span-3 lg:col-start-4 lg:mt-24 lg:self-start",
};
</script>
