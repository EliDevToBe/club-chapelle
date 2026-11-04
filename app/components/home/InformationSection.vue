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

      <div
        :class="[
          ui.scheduleBox,
          isEditing ? ui.scheduleBoxEditing : ui.scheduleBoxIdle,
        ]"
      >
        <OpeningHoursSection v-model:is-editing="isEditing" />
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
  // Both columns are pinned to row 1 *and* an explicit column on lg, so the schedule box can widen
  // over the text while editing. Without `col-start-1`, grid auto-placement pushes the text column
  // into implicit columns past the box instead of letting them overlap.
  mainColumn:
    "flex flex-col gap-12 lg:col-span-3 lg:col-start-1 lg:row-start-1 lg:pr-10",
  scheduleBox:
    "border-2 border-default p-6 sm:p-10 lg:row-start-1 lg:mt-24 lg:self-start",
  scheduleBoxIdle: "lg:col-span-3 lg:col-start-4",
  scheduleBoxEditing:
    "relative z-10 bg-arc-grey-100! shadow-2xl lg:col-span-5 lg:col-start-2",
};

const isEditing = ref(false);
</script>
