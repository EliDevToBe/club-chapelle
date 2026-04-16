<template>
  <div class="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto">
    <ContentPageWrapper>
      <ChapSection is-main-section title="Nous contacter">
        <ContentTextWrapper>
          <p>
            Directement par mail à
            <span>
              <NuxtLink
                class="inline-flex gap-0.5 text-primary font-bold hover:underline hover:underline-offset-4"
                to="mailto:archerschapelle@gmail.com"
              >
                <span> archerschapelle@gmail.com </span>

                <UIcon class="text-muted w-3" name="i-ph-envelope-duotone" />
              </NuxtLink>
            </span>
          </p>
          <p>
            Sur notre page
            <span>
              <NuxtLink
                class="inline-flex gap-0.5 text-primary font-bold hover:underline hover:underline-offset-4"
                :to="socialFacebook"
                target="_blank"
              >
                <span>Facebook</span>

                <UIcon
                  class="text-muted w-3"
                  name="i-ph-facebook-logo-duotone"
                />
              </NuxtLink>
            </span>
          </p>
        </ContentTextWrapper>

        <ContactForm class="md:hidden" />
      </ChapSection>

      <ChapSection title="Où nous trouver ?">
        <ContentTextWrapper>
          <p>
            Au
            <span class="text-primary"
              >Gymnase Tristan Tzara, 11 rue Tristan Tzara, 75018 PARIS
            </span>
          </p>
        </ContentTextWrapper>
      </ChapSection>

      <ChapSection title="Quand ?">
        <ContentTextWrapper>
          <ul :class="ui.listWrapper">
            <ChapListItem
              >Lundi de
              <span class="text-highlighted">19h30 à minuit</span></ChapListItem
            >
            <ChapListItem
              >Mercredi de
              <span class="text-highlighted">19h30 à minuit</span></ChapListItem
            >
            <ChapListItem
              >Jeudi de
              <span class="text-highlighted">18h à 20h</span></ChapListItem
            >
            <ChapListItem
              >Dimanche de
              <span class="text-highlighted">9h à 11h</span></ChapListItem
            >
          </ul>
          <p>Envoyez-nous un message afin de savoir s'il reste des places !</p>
        </ContentTextWrapper>
      </ChapSection>

      <AffiliationSection />
    </ContentPageWrapper>

    <ContentPageWrapper>
      <ContactForm class="hidden md:block md:pl-10" />
    </ContentPageWrapper>
  </div>
</template>

<script setup lang="ts">
import AffiliationSection from "~/components/affiliation/AffiliationSection.vue";
import ContactForm from "~/components/contact/ContactForm.vue";
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ContentTextWrapper from "~/components/layout/ContentTextWrapper.vue";
import ChapListItem from "~/components/ui/ChapListItem.vue";
import ChapSection from "~/components/ui/ChapSection.vue";

const { public: pub } = useRuntimeConfig();

const socialFacebook = computed(() => pub.socialFacebook);

definePageMeta({
  layout: "default",
});

const ui = {
  listWrapper: "flex flex-col gap-2",
};
</script>
