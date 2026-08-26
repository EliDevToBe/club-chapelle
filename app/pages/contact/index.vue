<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto">
      <ContentPageWrapper>
        <ChapSection is-main-section title="Nous contacter">
          <ContentTextWrapper>
            <p>
              Directement par mail à
              <ChapLink
                :to="`mailto:${contactEmail}`"
                :label="contactEmail"
                icon="i-ph-envelope-duotone"
              />
            </p>
            <p>
              Sur notre page
              <ChapLink
                :to="socialFacebook"
                label="Facebook"
                icon="i-ph-facebook-logo-duotone"
                target="_blank"
              />
            </p>
          </ContentTextWrapper>

          <ContactForm class="md:hidden" />
        </ChapSection>

        <ChapSection title="Où nous trouver ?">
          <ContentTextWrapper>
            <p>
              Au
              <span class="text-primary-500">{{ clubAddress }}</span>
            </p>
          </ContentTextWrapper>
        </ChapSection>

        <ChapSection title="Quand ?">
          <ContentTextWrapper>
            <ul :class="ui.listWrapper">
              <ChapListItem v-for="slot in openingHours.slots" :key="slot.id">
                {{ slot.label }} de
                <span class="text-highlighted">{{ slot.time_range }}</span>
              </ChapListItem>
            </ul>
            <p>
              Envoyez-nous un message afin de savoir s'il reste des places !
            </p>
          </ContentTextWrapper>
        </ChapSection>
      </ContentPageWrapper>

      <ContentPageWrapper class="hidden absolute md:block md:relative">
        <ContactForm class="hidden absolute md:block md:pl-10" />
      </ContentPageWrapper>
    </div>

    <ContentPageWrapper>
      <AffiliationSection />
    </ContentPageWrapper>
  </div>
</template>

<script setup lang="ts">
import AffiliationSection from "~/components/affiliation/AffiliationSection.vue";
import ContactForm from "~/components/contact/ContactForm.vue";
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ContentTextWrapper from "~/components/layout/ContentTextWrapper.vue";
import ChapLink from "~/components/ui/ChapLink.vue";
import ChapListItem from "~/components/ui/ChapListItem.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
import { useOpeningHours } from "~/composables/useOpeningHours";
import { useSiteSettings } from "~/composables/useSiteSettings";

const { contactEmail, clubAddress, facebookUrl } = useSiteSettings();
const { openingHours } = useOpeningHours();

const socialFacebook = facebookUrl;

definePageMeta({
  layout: "default",
});

const ui = {
  listWrapper: "flex flex-col gap-2",
};
</script>
