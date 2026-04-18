<template>
  <div class="relative isolate overflow-x-hidden">
    <!-- <div
      class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <span :class="[ui.watermark, 'mt-20 flex flex-col md:flex-row md:gap-8']">
        <span>ARC</span>
        <span>18</span>
      </span>
    </div> -->

    <ChapWatermark>
      <span class="mt-20 flex flex-col md:flex-row md:gap-8">
        <span>ARC</span>
        <span>18</span>
      </span>
    </ChapWatermark>

    <ContentPageWrapper class="relative z-10 h-full">
      <ChapSection
        is-main-section
        title="Travaux en cours"
        description="Cette partie du site est encore en préparation."
      >
        <ContentTextWrapper class="text-muted">
          <p>
            En attendant, vous pouvez consulter nos informations pratiques ou
            nous suivre sur les réseaux sociaux.
          </p>
        </ContentTextWrapper>
      </ChapSection>

      <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ChapButton to="/" label="Retour à l'accueil" />
        <ChapButton
          to="/infos"
          variant="solid"
          color="secondary"
          label="Informations pratiques"
        />
      </div>

      <SocialSection />
    </ContentPageWrapper>
  </div>
</template>

<script setup lang="ts">
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ContentTextWrapper from "~/components/layout/ContentTextWrapper.vue";
import SocialSection from "~/components/social/SocialSection.vue";
import ChapButton from "~/components/ui/ChapButton.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
import ChapWatermark from "~/components/ui/ChapWatermark.vue";

definePageMeta({
  layout: "default",
});
</script>
