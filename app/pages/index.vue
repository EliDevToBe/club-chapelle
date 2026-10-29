<template>
  <div>
    <HomeHero />
    <FeaturedEventSection />
    <DiscoverSection />
    <PhilosophySection />
    <InformationSection />
  </div>
</template>

<script setup lang="ts">
import DiscoverSection from "~/components/home/DiscoverSection.vue";
import FeaturedEventSection from "~/components/home/FeaturedEventSection.vue";
import HomeHero from "~/components/home/HomeHero.vue";
import InformationSection from "~/components/home/InformationSection.vue";
import PhilosophySection from "~/components/home/PhilosophySection.vue";

definePageMeta({
  layout: "default",
});

useHead({
  title: "Arc18 La Chapelle",
});
</script>
