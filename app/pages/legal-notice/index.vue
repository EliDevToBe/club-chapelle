<template>
  <ContentPageWrapper>
    <ChapSection
      is-main-section
      title="Mentions légales"
      description="Identification de l’éditeur et de l’hébergeur du site."
    >
      <ContentTextWrapper class="text-muted">
        <p>
          Le présent site est édité par l’association
          <span class="text-highlighted font-semibold">{{
            associationName
          }}</span
          >.
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection title="Éditeur">
      <ContentTextWrapper class="text-muted">
        <p>
          <span class="text-highlighted font-semibold">
            {{ associationName }}
          </span>
        </p>
        <p>
          Siège social :
          {{ displayOrUnspecified(settings.registered_office_address) }}
        </p>
        <p>
          Directeur·rice de la publication :
          {{ displayOrUnspecified(settings.publication_director) }}
        </p>
        <p v-if="settings.rna_number.length > 0">
          Numéro RNA : {{ settings.rna_number }}
        </p>
        <p v-if="settings.siret.length > 0">SIRET : {{ settings.siret }}</p>
        <p>
          Contact :
          <ChapLink
            :to="`mailto:${contactEmail}`"
            :label="contactEmail"
            icon="i-ph-envelope-duotone"
          />
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection title="Hébergement">
      <ContentTextWrapper class="text-muted">
        <p>
          Nom :
          {{ displayOrUnspecified(settings.hosting_provider_name) }}
        </p>
        <p>
          Adresse :
          {{ displayOrUnspecified(settings.hosting_provider_address) }}
        </p>
        <p>
          Téléphone :
          {{ displayOrUnspecified(settings.hosting_provider_phone) }}
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection title="Propriété intellectuelle">
      <ContentTextWrapper class="text-muted">
        <p>
          Les contenus de ce site (textes, visuels, marques) restent la
          propriété de l’association ou de leurs titulaires respectifs. Toute
          reproduction non autorisée est interdite, sauf exceptions prévues par
          la loi.
        </p>
        <p>
          Pour le traitement des données personnelles, voir la
          <ChapLink
            to="/privacy-policy"
            label="politique de confidentialité"
          />.
        </p>
      </ContentTextWrapper>
    </ChapSection>
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ContentTextWrapper from "~/components/layout/ContentTextWrapper.vue";
import ChapLink from "~/components/ui/ChapLink.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { ASSOCIATION_LEGAL_NAME } from "~~/shared/website/site-settings.seed";

definePageMeta({
  layout: "default",
});

useHead({
  title: "Mentions légales - Arc18",
});

const { settings, contactEmail } = useSiteSettings();
const associationName = ASSOCIATION_LEGAL_NAME;

const displayOrUnspecified = (value: string): string => {
  if (value.length === 0) {
    return "Non renseigné";
  }

  return value;
};
</script>
