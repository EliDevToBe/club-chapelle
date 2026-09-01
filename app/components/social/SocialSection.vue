<template>
  <ChapSection
    title="Suivez-nous"
    description="Retrouvez le club sur les réseaux !"
  >
    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:gap-4">
      <ChapButton
        :to="socialInstagram"
        target="_blank"
        icon="i-ph-instagram-logo-duotone"
        variant="outline"
        size="lg"
        label="Instagram"
      />
      <ChapButton
        :to="socialFacebook"
        target="_blank"
        icon="i-ph-facebook-logo-duotone"
        variant="outline"
        size="lg"
        label="Facebook"
      />
    </div>
  </ChapSection>
</template>

<script setup lang="ts">
import ChapButton from "~/components/ui/ChapButton.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
import { useSiteSettings } from "~/composables/useSiteSettings";

const { instagramUrl, facebookUrl } = await useSiteSettings();

const socialInstagram = instagramUrl;
const socialFacebook = facebookUrl;
</script>

<style scoped lang=""></style>
