<template>
  <ContentPageWrapper>
    <IntroductionSection />

    <CarouselSection />

    <SocialSection />

    <ContactSection />

    <AffiliationSection />
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";

definePageMeta({
  layout: "default",
});
</script>
