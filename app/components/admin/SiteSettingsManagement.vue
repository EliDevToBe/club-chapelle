<template>
  <div :class="ui.rootWrapper">
    <UForm :state="formState" @submit="onSubmit">
      <div :class="ui.formWrapper">
        <div :class="ui.fieldsWrapper">
          <UFormField label="E-mail de contact" name="contact_email" required>
            <UInput
              class="w-full"
              v-model="formState.contact_email"
              type="email"
              autocomplete="email"
              placeholder="archerschapelle@gmail.com"
              :disabled="isSaving || pending"
            />
          </UFormField>

          <UFormField label="Adresse du club" name="club_address" required>
            <UTextarea
              class="w-full"
              v-model="formState.club_address"
              :rows="4"
              placeholder="Gymnase Tristan Tzara, 11 rue Tristan Tzara, 75018 PARIS"
              :disabled="isSaving || pending"
            />
          </UFormField>
        </div>

        <div :class="ui.fieldsWrapper">
          <UFormField label="URL Instagram" name="instagram_url" required>
            <UInput
              class="w-full"
              v-model="formState.instagram_url"
              type="url"
              autocomplete="url"
              placeholder="https://www.instagram.com/..."
              :disabled="isSaving || pending"
            />
          </UFormField>

          <UFormField label="URL Facebook" name="facebook_url" required>
            <UInput
              class="w-full"
              v-model="formState.facebook_url"
              type="url"
              autocomplete="url"
              placeholder="https://www.facebook.com/..."
              :disabled="isSaving || pending"
            />
          </UFormField>
        </div>
      </div>

      <div :class="ui.actionsWrapper">
        <UButton
          type="submit"
          color="primary"
          icon="i-ph-floppy-disk-duotone"
          label="Enregistrer"
          :loading="isSaving"
          :disabled="isSaving || pending"
        />
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { useChapToast } from "~/composables/useChapToasts";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useZod } from "~/composables/useZod";
import { normaliseSocialUrl } from "~~/shared/website/normalise-social-url";
import { parseSiteSettings } from "~~/shared/website/site-settings.schema";
import type { SiteSettingsDto } from "~~/shared/website/website-config.dto";

const ui = {
  rootWrapper: "flex flex-col gap-3 px-2 pb-2",
  formWrapper: "flex flex-col md:flex-row gap-20",
  fieldsWrapper: "flex flex-col gap-8 w-full",
  actionsWrapper: "flex justify-end",
};

const { addToastError, addToastSuccess } = useChapToast();
const { getZodIssues } = useZod();
const { settings, saveSettings, isSaving, pending } = useSiteSettings();

const formState = reactive<SiteSettingsDto>({
  contact_email: "",
  club_address: "",
  instagram_url: "",
  facebook_url: "",
});

watch(
  settings,
  (nextSettings) => {
    formState.contact_email = nextSettings.contact_email;
    formState.club_address = nextSettings.club_address;
    formState.instagram_url = nextSettings.instagram_url;
    formState.facebook_url = nextSettings.facebook_url;
  },
  { immediate: true },
);

const onSubmit = async (): Promise<void> => {
  formState.instagram_url = normaliseSocialUrl(formState.instagram_url);
  formState.facebook_url = normaliseSocialUrl(formState.facebook_url);

  let validatedSettings: SiteSettingsDto;

  try {
    validatedSettings = parseSiteSettings({
      contact_email: formState.contact_email,
      club_address: formState.club_address,
      instagram_url: formState.instagram_url,
      facebook_url: formState.facebook_url,
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

  formState.contact_email = validatedSettings.contact_email;
  formState.club_address = validatedSettings.club_address;
  formState.instagram_url = validatedSettings.instagram_url;
  formState.facebook_url = validatedSettings.facebook_url;

  try {
    await saveSettings(validatedSettings);

    addToastSuccess({
      title: "Paramètres enregistrés",
      description: "Les réglages publics du site ont été mis à jour.",
    });
  } catch (submitError) {
    console.error(submitError);
    addToastError({
      title: "Échec de mise à jour",
      description: "Les paramètres du site n'ont pas pu être enregistrés.",
    });
  }
};
</script>
