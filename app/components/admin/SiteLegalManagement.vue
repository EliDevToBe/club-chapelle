<template>
  <div :class="ui.rootWrapper">
    <UForm :state="formState" @submit="onSubmit">
      <div :class="ui.legalSection">
        <div :class="ui.legalFields">
          <UFormField label="Siège social" name="registered_office_address">
            <UTextarea
              class="w-full"
              v-model="formState.registered_office_address"
              :rows="3"
              placeholder="Adresse du siège social"
              :disabled="isSaving || pending"
            />
          </UFormField>

          <UFormField
            label="Directeur·rice"
            name="publication_director"
            hint="Le·la président·e de l'association"
          >
            <UInput
              class="w-full"
              v-model="formState.publication_director"
              type="text"
              autocomplete="off"
              placeholder="Prénom Nom"
              :disabled="isSaving || pending"
            />
          </UFormField>

          <UFormField label="Numéro RNA" name="rna_number">
            <UInput
              class="w-full"
              v-model="formState.rna_number"
              type="text"
              placeholder="W123456789"
              :disabled="isSaving || pending"
            />
          </UFormField>

          <UFormField label="SIRET" name="siret" hint="Optionnel">
            <UInput
              class="w-full"
              v-model="formState.siret"
              type="text"
              placeholder="123 567 890 00012"
              :disabled="isSaving || pending"
            />
          </UFormField>

          <UFormField label="Hébergeur: nom" name="hosting_provider_name">
            <UInput
              class="w-full"
              v-model="formState.hosting_provider_name"
              type="text"
              placeholder="Raison sociale de l’hébergeur"
              :disabled="!isDeveloper"
            />
          </UFormField>

          <UFormField
            label="Hébergeur: adresse"
            name="hosting_provider_address"
          >
            <UInput
              class="w-full"
              v-model="formState.hosting_provider_address"
              placeholder="Adresse de l’hébergeur"
              :disabled="!isDeveloper"
            />
          </UFormField>

          <UFormField
            label="Hébergeur: téléphone"
            name="hosting_provider_phone"
          >
            <UInput
              class="w-full"
              v-model="formState.hosting_provider_phone"
              type="tel"
              autocomplete="off"
              placeholder="+33 …"
              :disabled="!isDeveloper"
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
import { useAuthUser } from "~/composables/useAuthUser";
import { useChapToast } from "~/composables/useChapToasts";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useZod } from "~/composables/useZod";
import {
  type LegalIdentitySettings,
  parseLegalIdentitySettings,
} from "~~/shared/website/site-settings.schema";
import { EMPTY_LEGAL_IDENTITY_SETTINGS } from "~~/shared/website/site-settings.seed";

const ui = {
  rootWrapper: "flex flex-col gap-3 px-2 pb-2",
  formWrapper: "flex flex-col md:flex-row gap-20",
  fieldsWrapper: "flex flex-col gap-8 w-full",
  legalSection: "flex flex-col gap-4 pt-8 ",
  legalHeading: "text-base font-semibold text-highlighted",
  legalHint: "text-sm text-muted",
  legalFields: "grid grid-cols-1 md:grid-cols-2 gap-8",
  actionsWrapper: "flex justify-end pt-4",
};

const { addToastError, addToastSuccess } = useChapToast();
const { getZodIssues } = useZod();
const { settings, saveSettings, isSaving, pending } = useSiteSettings();
const { isDeveloper } = useAuthUser();

const formState = reactive<LegalIdentitySettings>({
  ...EMPTY_LEGAL_IDENTITY_SETTINGS,
});

const assignFormState = (nextSettings: LegalIdentitySettings): void => {
  formState.registered_office_address = nextSettings.registered_office_address;
  formState.publication_director = nextSettings.publication_director;
  formState.rna_number = nextSettings.rna_number;
  formState.siret = nextSettings.siret;
  formState.hosting_provider_name = nextSettings.hosting_provider_name;
  formState.hosting_provider_address = nextSettings.hosting_provider_address;
  formState.hosting_provider_phone = nextSettings.hosting_provider_phone;
};

watch(
  settings,
  (nextSettings) => {
    assignFormState(nextSettings);
  },
  { immediate: true },
);

const onSubmit = async (): Promise<void> => {
  let validatedSettings: LegalIdentitySettings;

  try {
    validatedSettings = parseLegalIdentitySettings({ ...formState });
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

  assignFormState(validatedSettings);

  try {
    await saveSettings(validatedSettings);

    addToastSuccess({
      title: "Identité légale enregistrée",
      description: "Les mentions légales du site ont été mises à jour.",
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
