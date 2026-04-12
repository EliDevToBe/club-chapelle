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
    <UButton
      to="/contact"
      color="secondary"
      size="lg"
      class="min-h-11 w-full sm:w-auto"
    >
      Aller à la page Contact
    </UButton>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang=""></style>
