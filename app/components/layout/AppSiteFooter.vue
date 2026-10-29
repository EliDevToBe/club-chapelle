<template>
  <footer v-if="compact" :class="ui.dark">
    <SiteFooterBar />
  </footer>

  <footer v-else id="contact" :class="ui.root">
    <h2 class="sr-only">Contact</h2>

    <ContactMarquee />

    <div :class="ui.dark">
      <UContainer :class="ui.main">
        <div :class="ui.contactColumn">
          <address :class="ui.details">
            <ULink :to="`mailto:${contactEmail}`" raw :class="ui.detailLink">
              {{ contactEmail }}
            </ULink>
            <span v-if="clubAddress">{{ clubAddress }}</span>
          </address>

          <ul :class="ui.socialList" aria-label="Réseaux sociaux">
            <li>
              <ULink :to="instagramUrl" target="_blank" raw :class="ui.socialLink">
                <UIcon name="i-ph-instagram-logo" class="size-5" />
                Instagram
              </ULink>
            </li>
            <li>
              <ULink :to="facebookUrl" target="_blank" raw :class="ui.socialLink">
                <UIcon name="i-ph-facebook-logo" class="size-5" />
                Facebook
              </ULink>
            </li>
          </ul>

          <ContactForm />
        </div>

        <div :class="ui.crestColumn">
          <img
            src="/club-logo.svg"
            alt="Écusson ARC 18 Paris — Les Archers de la Chapelle"
            width="380"
            height="515"
            :class="ui.crest"
            loading="lazy"
            decoding="async"
          />
        </div>
      </UContainer>

      <SiteFooterBar />
    </div>
  </footer>
</template>

<script setup lang="ts">
import ContactForm from "~/components/contact/ContactForm.vue";
import ContactMarquee from "~/components/layout/ContactMarquee.vue";
import SiteFooterBar from "~/components/layout/SiteFooterBar.vue";
import { useSiteSettings } from "~/composables/useSiteSettings";

defineProps<{
  /** Member area: footer bar only, without the CONTACT band and form. */
  compact?: boolean;
}>();

const { contactEmail, clubAddress, instagramUrl, facebookUrl } =
  await useSiteSettings();

const ui = {
  root: "scroll-mt-(--ui-header-height)",
  dark: "dark bg-default text-default",
  main: "relative grid grid-cols-1 gap-12 py-12 md:grid-cols-12 md:py-16",
  contactColumn: "flex flex-col gap-8 md:col-span-7",
  details: "flex flex-col gap-2 not-italic text-lg",
  detailLink: "w-fit hover:text-primary transition-colors",
  socialList: "flex flex-wrap gap-6",
  socialLink: [
    "inline-flex items-center gap-2 font-label font-bold uppercase tracking-wide text-sm",
    "text-primary hover:underline underline-offset-4",
  ],
  crestColumn:
    "flex justify-center md:col-span-5 md:justify-end md:items-start",
  crest: [
    "relative z-10 w-48 sm:w-60 md:w-72 lg:w-80 h-auto",
    "md:-mt-36 lg:-mt-40",
  ],
};
</script>
