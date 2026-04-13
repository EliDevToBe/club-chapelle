<template>
  <div class="relative isolate overflow-x-hidden">
    <div
      class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <span :class="[ui.watermark, 'mt-20 flex flex-col md:flex-row md:gap-8']">
        <span>ARC</span>
        <span>18</span>
      </span>
    </div>

    <ContentPageWrapper class="relative z-10 h-full">
      <ChapSection
        is-main-section
        title="Travaux en cours"
        description="Cette partie du site est encore en préparation."
      >
        <ContentTextWrapper class="text-muted">
          <p>
            La page de contact dédiée et l’espace membre (connexion) seront
            proposés ici prochainement.
          </p>
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

definePageMeta({
  layout: "default",
});

const watermarkLabel = "ARC 18";

const ui = {
  watermark: [
    "select-none font-bold tabular-nums leading-none tracking-tighter",
    "text-highlighted/[0.07] dark:text-highlighted/[0.11]",
    "text-[min(18rem,55vw)] sm:text-[min(22rem,50vw)]",
  ],
};
</script>
