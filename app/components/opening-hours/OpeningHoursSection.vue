<template>
  <ChapSection title="Les créneaux">
    <template v-if="isAdmin && !isEditing" #title-actions>
      <div class="flex justify-center" :class="ui.editTrigger">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-ph-gear-duotone"
          :class="ui.editTrigger"
          :aria-label="ui.copy.editAria"
          :disabled="pending"
          @click="enterEdit"
        />
      </div>
    </template>

    <ContentTextWrapper>
      <UTextarea
        v-if="isEditing"
        v-model="formState.intro"
        :rows="2"
        :class="ui.introInput"
        :disabled="isSaving"
        :placeholder="ui.copy.introPlaceholder"
        autoresize
        :ui="{
          base: 'text-muted text-base!',
        }"
      />
      <p v-else-if="openingHours.intro">
        {{ openingHours.intro }}
      </p>

      <ul ref="slotsListEl" :class="ui.listWrapper">
        <ChapListItem
          v-for="(slot, slotIndex) in displayedSlots"
          :key="slot.id"
        >
          <template v-if="isEditing" #leading>
            <button
              type="button"
              class="creneau-drag-handle"
              :class="ui.dragHandle"
              :aria-label="`${ui.copy.reorderAria} ${slotIndex + 1}`"
              :disabled="isSaving"
            >
              <UIcon name="i-ph-dots-six-vertical-bold" />
            </button>
          </template>

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
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-ph-trash-duotone"
              :aria-label="`${ui.copy.removeAria} ${slotIndex + 1}`"
              :disabled="isSaving"
              @click="removeSlot(slotIndex)"
            />
          </template>
        </ChapListItem>
      </ul>

      <div v-if="isEditing" :class="ui.addRow">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-ph-plus-bold"
          :label="ui.copy.addSlot"
          :disabled="isSaving"
          @click="addSlot"
        />
      </div>

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

      <div v-if="isEditing" :class="ui.actions">
        <UButton
          color="neutral"
          variant="ghost"
          :label="ui.copy.cancel"
          :disabled="isSaving"
          @click="cancelEdit"
        />
        <UButton
          color="primary"
          icon="i-ph-floppy-disk-duotone"
          :label="ui.copy.save"
          :loading="isSaving"
          :disabled="isSaving"
          @click="saveEdit"
        />
      </div>
    </ContentTextWrapper>
  </ChapSection>
</template>

<script setup lang="ts">
import { useSortable } from "@vueuse/integrations/useSortable";
import ContentTextWrapper from "~/components/layout/ContentTextWrapper.vue";
import ChapListItem from "~/components/ui/ChapListItem.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
import { useChapToast } from "~/composables/useChapToasts";
import { useOpeningHours } from "~/composables/useOpeningHours";
import { useZod } from "~/composables/useZod";
import {
  cloneOpeningHours,
  createEmptyOpeningHoursSlot,
  type OpeningHours,
  type OpeningHoursSlot,
  parseOpeningHours,
} from "~~/shared/website/opening-hours.schema";

const ui = {
  listWrapper: "flex flex-col gap-2",
  listMainElement: "text-default font-semibold",
  highlightText: "text-secondary-300 font-semibold underline",
  audienceView: "text-muted",
  editTrigger:
    "opacity-0 transition-opacity duration-150 group-hover/title:opacity-100 group-focus-within/title:opacity-100 [@media(hover:none)]:opacity-100",
  dragHandle:
    "mt-1 inline-flex cursor-grab items-center text-muted active:cursor-grabbing disabled:cursor-not-allowed",
  editLine: "flex flex-wrap items-baseline gap-x-1 gap-y-1",
  inlineInput:
    "min-w-[6ch] max-w-full bg-transparent border-0 border-b border-dashed border-muted px-0.5 py-0 leading-relaxed focus:outline-none focus:border-primary-500",
  scheduleInput: "font-semibold text-highlighted",
  highlightInput: "text-secondary-300 font-semibold underline min-w-[12ch]",
  audienceInput: "text-muted min-w-[12ch] flex-1",
  introInput: "w-full bg-transparent text-muted text-base md:text-lg",
  epilogueInput: "w-full bg-transparent text-muted text-base md:text-lg",
  addRow: "flex justify-center",
  actions: "flex justify-end gap-2 pt-2",
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
    cancel: "Annuler",
    save: "Enregistrer",
  },
};

const { addToastError, addToastSuccess } = useChapToast();
const { getZodIssues } = useZod();
const { isAdmin, hydrateIfNeeded } = useAuthUser();
const { openingHours, saveOpeningHours, isSaving, pending } = useOpeningHours();

const isEditing = ref(false);
const formState = reactive<OpeningHours>({
  intro: "",
  epilogue: "",
  slots: [],
});

const slotsListEl = useTemplateRef<HTMLElement>("slotsListEl");
const formSlots = toRef(formState, "slots");
let stopSortable: (() => void) | null = null;

const displayedSlots = computed((): OpeningHoursSlot[] => {
  if (isEditing.value) {
    return formState.slots;
  }

  return openingHours.value.slots;
});

const scheduleClass = (slot: OpeningHoursSlot): string | undefined => {
  if (slot.highlight) {
    return "text-primary-500";
  }

  return undefined;
};

const hydrateForm = (nextHours: OpeningHours): void => {
  const cloned = cloneOpeningHours(nextHours);
  formState.intro = cloned.intro;
  formState.epilogue = cloned.epilogue;
  formState.slots = cloned.slots;
};

const enterEdit = (): void => {
  hydrateForm(openingHours.value);
  isEditing.value = true;
};

const cancelEdit = (): void => {
  stopSortable?.();
  stopSortable = null;
  hydrateForm(openingHours.value);
  isEditing.value = false;
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
    stopSortable?.();
    stopSortable = null;
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

watch(isEditing, async (editing) => {
  if (!import.meta.client) {
    return;
  }

  if (!editing) {
    stopSortable?.();
    stopSortable = null;
    return;
  }

  await nextTick();
  const sortable = useSortable(slotsListEl, formSlots, {
    handle: ".creneau-drag-handle",
    animation: 200,
    filter: "input, textarea, button:not(.creneau-drag-handle)",
    preventOnFilter: false,
  });
  stopSortable = sortable.stop;
});

try {
  await hydrateIfNeeded();
} catch {
  // Stay in visitor view if the session cannot be resolved.
}
</script>
