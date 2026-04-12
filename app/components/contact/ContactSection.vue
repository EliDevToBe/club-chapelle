<template>
  <section
    aria-labelledby="landing-contact-title"
    class="space-y-3 md:space-y-4"
  >
    <h2
      id="landing-contact-title"
      class="text-lg font-semibold text-highlighted md:text-xl"
    >
      Contact
    </h2>
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
  </section>
</template>

<script setup lang="ts">
import ChapButton from "~/components/ui/ChapButton.vue";
</script>

<style scoped lang=""></style>
