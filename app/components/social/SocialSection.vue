<template>
  <ChapSection title="Suivez-nous">
    <p class="text-muted text-sm md:text-base">
      Retrouvez le club sur les réseaux !
    </p>
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

const { public: pub } = useRuntimeConfig();

const socialInstagram = computed(() => pub.socialInstagram);
const socialFacebook = computed(() => pub.socialFacebook);
</script>

<style scoped lang=""></style>
