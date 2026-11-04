<template>
  <SiteSection v-if="featuredEvent.enabled || isAdmin" id="evenement" tone="white">
    <div :class="ui.root">
      <div v-if="isAdmin && !isEditing" :class="ui.adminBar">
        <span v-if="!featuredEvent.enabled" :class="ui.hiddenNotice">
          {{ ui.copy.hiddenNotice }}
        </span>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-ph-gear-duotone"
          :aria-label="ui.copy.editAria"
          :disabled="pending"
          @click="enterEdit"
        />
      </div>

      <form v-if="isEditing" :class="ui.form" @submit.prevent="saveEdit">
        <USwitch v-model="formState.enabled" :label="ui.copy.enabled" />

        <UFormField :label="ui.copy.title" required>
          <UInput v-model="formState.title" :disabled="isSaving" class="w-full" />
        </UFormField>

        <div :class="ui.formRow">
          <UFormField :label="ui.copy.imageUrl" :hint="ui.copy.imageUrlHint">
            <UInput
              v-model="formState.image_url"
              type="url"
              :disabled="isSaving"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="ui.copy.imageAlt">
            <UInput v-model="formState.image_alt" :disabled="isSaving" class="w-full" />
          </UFormField>
        </div>

        <UFormField :label="ui.copy.paragraphs" :hint="ui.copy.paragraphsHint">
          <UTextarea
            v-model="formState.paragraphsText"
            :rows="4"
            autoresize
            :disabled="isSaving"
            class="w-full"
          />
        </UFormField>

        <div :class="ui.formRow">
          <UFormField :label="ui.copy.ctaLabel">
            <UInput v-model="formState.cta_label" :disabled="isSaving" class="w-full" />
          </UFormField>
          <UFormField :label="ui.copy.ctaUrl" :hint="ui.copy.ctaUrlHint">
            <UInput v-model="formState.cta_url" :disabled="isSaving" class="w-full" />
          </UFormField>
        </div>

        <div :class="ui.formActions">
          <UButton
            color="neutral"
            variant="ghost"
            :label="ui.copy.cancel"
            :disabled="isSaving"
            @click="cancelEdit"
          />
          <UButton
            type="submit"
            color="primary"
            icon="i-ph-floppy-disk-duotone"
            :label="ui.copy.save"
            :loading="isSaving"
            :disabled="isSaving"
          />
        </div>
      </form>

      <div v-else :class="[ui.grid, { 'opacity-50': !featuredEvent.enabled }]">
        <h2 class="sr-only">{{ featuredEvent.title }}</h2>

        <img
          v-if="featuredEvent.image_url"
          :src="featuredEvent.image_url"
          :alt="featuredEvent.image_alt"
          width="900"
          height="600"
          :class="ui.image"
          loading="lazy"
          decoding="async"
        />

        <div :class="ui.body">
          <ContentTextWrapper :class="ui.text">
            <p
              v-for="(paragraph, paragraphIndex) in featuredEvent.paragraphs"
              :key="`featured-paragraph-${paragraphIndex}`"
            >
              {{ paragraph }}
            </p>
          </ContentTextWrapper>

          <ChapButton
            v-if="featuredEvent.cta_label && featuredEvent.cta_url"
            :to="featuredEvent.cta_url"
            :target="isExternalLink ? '_blank' : undefined"
            :label="featuredEvent.cta_label"
            variant="outline"
            additional-class="w-fit"
          />
        </div>
      </div>
    </div>
  </SiteSection>
</template>

<script setup lang="ts">
import ContentTextWrapper from "~/components/layout/ContentTextWrapper.vue";
import SiteSection from "~/components/layout/SiteSection.vue";
import ChapButton from "~/components/ui/ChapButton.vue";
import { useChapToast } from "~/composables/useChapToasts";
import { useFeaturedEvent } from "~/composables/useFeaturedEvent";
import { useZod } from "~/composables/useZod";
import {
  type FeaturedEvent,
  parseFeaturedEvent,
} from "~~/shared/website/featured-event.schema";

type FeaturedEventFormState = Omit<FeaturedEvent, "paragraphs"> & {
  /** Paragraphs are edited as one text, separated by a blank line. */
  paragraphsText: string;
};

const PARAGRAPH_SEPARATOR = "\n\n";

const ui = {
  root: "relative",
  adminBar: "absolute -top-10 right-0 flex items-center gap-3",
  hiddenNotice: "text-sm text-muted",
  grid: "grid grid-cols-1 items-center gap-10 md:grid-cols-6 md:gap-x-2.5",
  image: "w-full max-h-96 object-contain md:col-span-3",
  body: "flex flex-col gap-6 md:col-span-3 md:col-start-4 lg:col-span-2 lg:col-start-5",
  text: "text-primary font-medium",
  form: "flex flex-col gap-4 max-w-3xl",
  formRow: "grid grid-cols-1 gap-4 sm:grid-cols-2",
  formActions: "flex justify-end gap-2 pt-2",
  copy: {
    editAria: "Modifier l'événement à la une",
    hiddenNotice: "Masqué pour les visiteurs",
    enabled: "Afficher le bloc sur la page d'accueil",
    title: "Titre (lu par les lecteurs d'écran)",
    imageUrl: "Image (URL)",
    imageUrlHint: "https://…",
    imageAlt: "Description de l'image",
    paragraphs: "Texte",
    paragraphsHint: "Une ligne vide sépare les paragraphes",
    ctaLabel: "Libellé du bouton",
    ctaUrl: "Lien du bouton",
    ctaUrlHint: "https://… ou /chemin",
    cancel: "Annuler",
    save: "Enregistrer",
  },
};

const { addToastError, addToastSuccess } = useChapToast();
const { getZodIssues } = useZod();
const { isAdmin, hydrateIfNeeded } = useAuthUser();

try {
  await hydrateIfNeeded();
} catch {
  // Stay in visitor view if the session cannot be resolved.
}

const { featuredEvent, saveFeaturedEvent, isSaving, pending } =
  await useFeaturedEvent({ asAdmin: isAdmin.value === true });

const isEditing = ref(false);
const formState = reactive<FeaturedEventFormState>({
  enabled: true,
  title: "",
  image_url: "",
  image_alt: "",
  paragraphsText: "",
  cta_label: "",
  cta_url: "",
});

const isExternalLink = computed(() => {
  return /^https?:\/\//i.test(featuredEvent.value.cta_url);
});

const hydrateForm = (event: FeaturedEvent): void => {
  formState.enabled = event.enabled;
  formState.title = event.title;
  formState.image_url = event.image_url;
  formState.image_alt = event.image_alt;
  formState.paragraphsText = event.paragraphs.join(PARAGRAPH_SEPARATOR);
  formState.cta_label = event.cta_label;
  formState.cta_url = event.cta_url;
};

const enterEdit = (): void => {
  hydrateForm(featuredEvent.value);
  isEditing.value = true;
};

const cancelEdit = (): void => {
  hydrateForm(featuredEvent.value);
  isEditing.value = false;
};

const saveEdit = async (): Promise<void> => {
  let validatedEvent: FeaturedEvent;

  try {
    validatedEvent = parseFeaturedEvent({
      enabled: formState.enabled,
      title: formState.title,
      image_url: formState.image_url,
      image_alt: formState.image_alt,
      paragraphs: formState.paragraphsText.split(/\n\s*\n/),
      cta_label: formState.cta_label,
      cta_url: formState.cta_url,
    });
  } catch (validationError) {
    const issues = getZodIssues(validationError);

    addToastError({
      title: "Champs invalides",
      description:
        issues?.[0]?.message ??
        "Veuillez vérifier que tous les champs sont correctement remplis.",
    });

    return;
  }

  try {
    await saveFeaturedEvent(validatedEvent);
    isEditing.value = false;
    addToastSuccess({
      title: "Événement enregistré",
      description: "Le bloc de la page d'accueil a été mis à jour.",
    });
  } catch (submitError) {
    console.error(submitError);
    addToastError({
      title: "Échec de mise à jour",
      description: "L'événement n'a pas pu être enregistré.",
    });
  }
};
</script>
