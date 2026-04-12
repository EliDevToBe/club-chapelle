<template>
  <div :class="ui.root">
    <IntroductionSection />

    <CarouselSection />

    <SocialSection />

    <ContactSection />

    <AffiliationSection />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const ui = {
  root: "mx-auto max-w-5xl px-4 py-8 md:py-12 space-y-10 md:space-y-14",
};
</script>
