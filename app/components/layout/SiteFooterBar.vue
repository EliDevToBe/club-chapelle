<template>
  <div :class="ui.root">
    <UContainer :class="ui.container">
      <p :class="ui.copyright">© {{ currentYear }} {{ associationName }}</p>

      <ul :class="ui.affiliations" aria-label="Affiliations">
        <li v-for="affiliation in AFFILIATIONS" :key="affiliation.to">
          <ULink :to="affiliation.to" target="_blank" :class="ui.link">
            <span class="flex items-center gap-2">
              <img
                :src="affiliation.logo"
                :alt="affiliation.alt"
                :class="[ui.affiliateLogo, affiliation.logoClass]"
              />
              {{ affiliation.label }}
            </span>
            <span class="sr-only">(nouvel onglet)</span>
          </ULink>
        </li>
      </ul>

      <ul :class="ui.legal" aria-label="Informations légales">
        <li class="flex items-center gap-2">
          <ULink to="/legal-notice" :class="ui.link">Mentions légales</ULink>
          <ULink to="/privacy-policy" :class="ui.link">Confidentialité</ULink>
        </li>
        <li>
          <ULink
            to="https://archers-chapelle.sirv.com/Images/dakos.jpg"
            target="_blank"
            :class="ui.link"
          >
            <span class="whitespace-nowrap flex items-center">
              <span> Avec ❤️ pour les Archers de la Chapelle&nbsp;</span>
              <UIcon name="i-ph-github-logo-duotone" />
            </span>
            <span class="sr-only">(nouvel onglet)</span>
          </ULink>
        </li>
      </ul>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import fftaLogo from "~/assets/ffta-logo.svg";
import { ASSOCIATION_LEGAL_NAME } from "~~/shared/website/site-settings.seed";

const AFFILIATIONS = [
  {
    label: "FFTA",
    to: "https://www.ffta.fr/",
    logo: fftaLogo,
    alt: "Logo FFTA",
    logoClass: "bg-white rounded-full",
  },
  {
    label: "Comité régional Île-de-France",
    to: "https://www.tiralarcidf.com/",
    logo: "https://www.tiralarcidf.com/favicon.ico",
    alt: "Logo Comité régional Île-de-France",
  },
  {
    label: "Comité départemental Paris",
    to: "https://www.tiralarc75.fr/",
    logo: "https://image.jimcdn.com/app/cms/image/transf/dimension=368x2048:format=png/path/sbb8f48a2570a7cb2/image/i81628e94c40d3dd9/version/1765982888/image.png",
    alt: "Logo Comité départemental Paris",
    logoClass: "bg-white rounded-full",
  },
];

const associationName = ASSOCIATION_LEGAL_NAME;
const currentYear = new Date().getFullYear();

const ui = {
  root: "border-t border-default",
  container:
    "flex flex-col items-center gap-6 py-8 text-center text-sm text-muted md:grid md:grid-cols-3 md:items-start md:gap-4 md:py-6 md:text-left",
  // Mobile: copyright closes the footer; desktop: it leads the first column.
  copyright: "order-last md:order-none",
  affiliations: "flex flex-col items-center gap-3 md:items-start md:gap-2",
  legal:
    "flex flex-wrap justify-center gap-x-5 gap-y-2 md:flex-col md:justify-start",
  link: "flex items-center gap-1 hover:text-highlighted transition-colors",
  affiliateLogo: "size-6 shrink-0",
};
</script>
