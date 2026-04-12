<template>
  <ChapSection title="Contact">
    <p class="text-muted text-sm md:text-base">
      Une question ? Écrivez-nous ou rendez-vous sur la page dédiée.
    </p>
    <ChapButton
      to="/contact"
      size="lg"
      color="secondary"
      class="min-h-11 w-full sm:w-auto sm:justify-center"
      label="Nous contacter"
    />
  </ChapSection>
</template>

<script setup lang="ts">
import ChapButton from "~/components/ui/ChapButton.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
</script>

<style scoped lang=""></style>
