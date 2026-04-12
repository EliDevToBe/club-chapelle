<template>
  <section
    aria-labelledby="landing-social-title"
    class="space-y-3 md:space-y-4"
  >
    <h2
      id="landing-social-title"
      class="text-lg font-semibold text-highlighted md:text-xl"
    >
      Suivez-nous
    </h2>
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
  </section>
</template>

<script setup lang="ts">
import ChapButton from "~/components/ui/ChapButton.vue";

const { public: pub } = useRuntimeConfig();

const socialInstagram = computed(() => pub.socialInstagram);
const socialFacebook = computed(() => pub.socialFacebook);
</script>

<style scoped lang=""></style>
