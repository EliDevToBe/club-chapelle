<template>
  <EditableChapSection
    enable-subtitle
    :title="openingHours.title"
    v-model:title-draft="formState.title"
    :subtitle="openingHours.subtitle"
    v-model:subtitle-draft="formState.subtitle"
    :is-editing="isEditing"
    :is-admin="isAdmin === true"
    :pending="pending"
    :is-saving="isSaving"
    :edit-aria="ui.copy.editAria"
    @enter-edit="enterEdit"
    @cancel="cancelEdit"
    @save="saveEdit"
  >
    <ContentTextWrapper>
      <StructuredListBody
        v-model:intro="formState.intro"
        v-model:items="formState.slots"
        :is-editing="isEditing"
        :is-saving="isSaving"
        :view-intro="openingHours.intro"
        :view-items="openingHours.slots"
        :intro-placeholder="ui.copy.introPlaceholder"
        :add-label="ui.copy.addSlot"
        @add="addSlot"
      >
        <template #item="{ item: slot, index: slotIndex }">
          <EditableChapListItem
            :is-editing="isEditing"
            :disabled="isSaving"
            :reorder-aria="`${ui.copy.reorderAria} ${slotIndex + 1}`"
            :remove-aria="`${ui.copy.removeAria} ${slotIndex + 1}`"
            @remove="removeSlot(slotIndex)"
          >
            <span v-if="isEditing" :class="ui.editLine">
              <input
                v-model="slot.label"
                type="text"
                :class="[ui.inlineInput, ui.scheduleInput, scheduleClass(slot)]"
                :disabled="isSaving"
                :aria-label="ui.copy.labelAria"
                :placeholder="ui.copy.labelPlaceholder"
              />
              <span :class="scheduleClass(slot)">de</span>
              <input
                v-model="slot.time_range"
                type="text"
                :class="[ui.inlineInput, ui.scheduleInput, scheduleClass(slot)]"
                :disabled="isSaving"
                :aria-label="ui.copy.timeAria"
                :placeholder="ui.copy.timePlaceholder"
              />
              <span :class="scheduleClass(slot)">:</span>
              <input
                v-if="slot.highlight"
                v-model="slot.highlight_text"
                type="text"
                :class="[ui.inlineInput, ui.highlightInput]"
                :disabled="isSaving"
                :aria-label="ui.copy.highlightAria"
                :placeholder="ui.copy.highlightPlaceholder"
              />
              <input
                v-model="slot.audience"
                type="text"
                :class="[ui.inlineInput, ui.audienceInput]"
                :disabled="isSaving"
                :aria-label="ui.copy.audienceAria"
                :placeholder="ui.copy.audiencePlaceholder"
              />
            </span>
            <template v-else>
              <span :class="[ui.listMainElement, scheduleClass(slot)]">
                {{ slot.label }} de {{ slot.time_range }} :
              </span>
              <template v-if="slot.highlight && slot.highlight_text">
                {{ " " }}
                <span :class="ui.highlightText">{{ slot.highlight_text }}</span>
              </template>
              <template v-if="slot.audience">
                {{ " " }}
                <span :class="ui.audienceView">{{ slot.audience }}</span>
              </template>
            </template>

            <template v-if="isEditing" #trailing>
              <USwitch
                v-model="slot.highlight"
                size="sm"
                :disabled="isSaving"
                :label="ui.copy.initiation"
              />
            </template>
          </EditableChapListItem>
        </template>

        <template #footer>
          <UTextarea
            v-if="isEditing"
            v-model="formState.epilogue"
            :rows="3"
            :class="ui.epilogueInput"
            :disabled="isSaving"
            :placeholder="ui.copy.epiloguePlaceholder"
            autoresize
            :ui="{
              base: 'text-muted text-base!',
            }"
          />
          <p v-else-if="openingHours.epilogue">
            {{ openingHours.epilogue }}
          </p>
        </template>
      </StructuredListBody>
    </ContentTextWrapper>
  </EditableChapSection>
</template>

<script setup lang="ts">
import ContentTextWrapper from "~/components/layout/ContentTextWrapper.vue";
import EditableChapListItem from "~/components/ui/EditableChapListItem.vue";
import EditableChapSection from "~/components/ui/EditableChapSection.vue";
import StructuredListBody from "~/components/website/StructuredListBody.vue";
import { useChapToast } from "~/composables/useChapToasts";
import { useOpeningHours } from "~/composables/useOpeningHours";
import { useZod } from "~/composables/useZod";
import {
  cloneOpeningHours,
  type OpeningHours,
  type OpeningHoursSlot,
  parseOpeningHours,
} from "~~/shared/website/opening-hours.schema";

const ui = {
  listMainElement: "text-default font-semibold",
  highlightText: "text-secondary-300 font-semibold underline",
  audienceView: "text-muted",
  editLine: "flex flex-wrap items-baseline gap-x-1 gap-y-1",
  inlineInput:
    "min-w-[6ch] max-w-full bg-transparent border-0 border-b border-dashed border-muted px-0.5 py-0 leading-relaxed focus:outline-none focus:border-primary-500",
  scheduleInput: "font-semibold text-highlighted",
  highlightInput: "text-secondary-300 font-semibold underline min-w-[12ch]",
  audienceInput: "text-muted min-w-[12ch] flex-1",
  epilogueInput: "w-full bg-transparent text-muted text-base md:text-lg",
  copy: {
    editAria: "Modifier les créneaux",
    reorderAria: "Réordonner le créneau",
    removeAria: "Supprimer le créneau",
    labelAria: "Libellé",
    timeAria: "Horaires",
    highlightAria: "Texte mis en avant",
    audienceAria: "Public",
    labelPlaceholder: "le lundi soir",
    timePlaceholder: "19h30 à minuit",
    highlightPlaceholder: "dédié à l'initiation",
    audiencePlaceholder: "ouvert à toutes et tous",
    introPlaceholder: "Introduction des créneaux",
    epiloguePlaceholder: "Texte sous la liste",
    initiation: "Initiation",
    addSlot: "Ajouter un créneau",
  },
};

const { addToastError, addToastSuccess } = useChapToast();
const { getZodIssues } = useZod();
const { isAdmin, hydrateIfNeeded } = useAuthUser();
const { openingHours, saveOpeningHours, isSaving, pending } =
  await useOpeningHours();

const isEditing = ref(false);
const formState = reactive<OpeningHours>({
  title: "",
  subtitle: "",
  intro: "",
  epilogue: "",
  slots: [],
});

const scheduleClass = (slot: OpeningHoursSlot): string | undefined => {
  if (slot.highlight) {
    return "text-primary-500";
  }

  return undefined;
};

const hydrateForm = (nextHours: OpeningHours): void => {
  const cloned = cloneOpeningHours(nextHours);
  formState.title = cloned.title;
  formState.subtitle = cloned.subtitle;
  formState.intro = cloned.intro;
  formState.epilogue = cloned.epilogue;
  formState.slots = cloned.slots;
};

const enterEdit = (): void => {
  hydrateForm(openingHours.value);
  isEditing.value = true;
};

const cancelEdit = (): void => {
  hydrateForm(openingHours.value);
  isEditing.value = false;
};

const createEmptyOpeningHoursSlot = (): OpeningHoursSlot => {
  return {
    id: crypto.randomUUID(),
    label: "",
    time_range: "",
    audience: "",
    highlight: false,
    highlight_text: "",
  };
};

const addSlot = (): void => {
  formState.slots.push(createEmptyOpeningHoursSlot());
};

const removeSlot = (slotIndex: number): void => {
  formState.slots.splice(slotIndex, 1);
};

const saveEdit = async (): Promise<void> => {
  let validatedHours: OpeningHours;

  try {
    validatedHours = parseOpeningHours(formState);
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
    await saveOpeningHours(validatedHours);
    isEditing.value = false;
    addToastSuccess({
      title: "Créneaux enregistrés",
      description: "Les horaires publics ont été mis à jour.",
    });
  } catch (submitError) {
    console.error(submitError);
    addToastError({
      title: "Échec de mise à jour",
      description: "Les créneaux n'ont pas pu être enregistrés.",
    });
  }
};

try {
  await hydrateIfNeeded();
} catch {
  // Stay in visitor view if the session cannot be resolved.
}
</script>
