<template>
  <div :class="ui.root">
    <UContainer :class="ui.container">
      <p>© {{ currentYear }} {{ associationName }}</p>

      <ul :class="ui.inlineList" aria-label="Affiliations">
        <li v-for="affiliation in AFFILIATIONS" :key="affiliation.to">
          <ULink :to="affiliation.to" target="_blank" :class="ui.link">
            {{ affiliation.label }}
          </ULink>
        </li>
      </ul>

      <ul :class="ui.inlineList" aria-label="Informations légales">
        <li>
          <ULink to="/legal-notice" :class="ui.link">Mentions légales</ULink>
        </li>
        <li>
          <ULink to="/privacy-policy" :class="ui.link">Confidentialité</ULink>
        </li>
        <li>
          <ULink
            to="https://archers-chapelle.sirv.com/Images/dakos.jpg"
            target="_blank"
            :class="ui.link"
          >
            Avec ❤️ pour les Archers de la Chapelle
          </ULink>
        </li>
      </ul>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { ASSOCIATION_LEGAL_NAME } from "~~/shared/website/site-settings.seed";

const AFFILIATIONS = [
  { label: "FFTA", to: "https://www.ffta.fr/" },
  { label: "Comité régional Île-de-France", to: "https://www.tiralarcidf.com/" },
  { label: "Comité départemental Paris", to: "https://www.tiralarc75.fr/" },
];

const associationName = ASSOCIATION_LEGAL_NAME;
const currentYear = new Date().getFullYear();

const ui = {
  root: "border-t border-default",
  container:
    "flex flex-col gap-4 py-6 text-sm text-muted lg:flex-row lg:items-center lg:justify-between",
  inlineList: "flex flex-wrap gap-x-5 gap-y-2",
  link: "hover:text-highlighted transition-colors",
};
</script>
