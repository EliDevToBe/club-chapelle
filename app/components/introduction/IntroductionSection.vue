<template>
  <TextContentSection
    :section-key="TEXT_SECTION_KEYS.homepageWelcome"
    is-main-section
    muted
  />
</template>

<script setup lang="ts">
import TextContentSection from "~/components/website/TextContentSection.vue";
import { TEXT_SECTION_KEYS } from "~~/shared/website/website-config.keys";
</script>
