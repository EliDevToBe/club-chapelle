<template>
  <ContentPageWrapper>
    <IntroductionSection />

    <CarouselSection class="mb-11" />

    <div class="flex flex-col md:flex-row justify-between gap-9">
      <ContactSection />
      <SocialSection />
    </div>

    <AffiliationSection />
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";

definePageMeta({
  layout: "default",
});
</script>
