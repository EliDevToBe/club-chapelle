<template>
  <ContentPageWrapper>
    <TextContentSection
      :section-key="TEXT_SECTION_KEYS.infosIntroduction"
      is-main-section
      muted
    />

    <OpeningHoursSection />

    <TarifsSection />

    <TextContentSection :section-key="TEXT_SECTION_KEYS.clubPhilosophy" />

    <div class="flex flex-col md:flex-row justify-between gap-9">
      <ContactSection />
      <SocialSection />
    </div>
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import ContactSection from "~/components/contact/ContactSection.vue";
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import OpeningHoursSection from "~/components/opening-hours/OpeningHoursSection.vue";
import SocialSection from "~/components/social/SocialSection.vue";
import TarifsSection from "~/components/tarifs/TarifsSection.vue";
import TextContentSection from "~/components/website/TextContentSection.vue";
import { TEXT_SECTION_KEYS } from "~~/shared/website/website-config.keys";

definePageMeta({
  layout: "default",
});
</script>
