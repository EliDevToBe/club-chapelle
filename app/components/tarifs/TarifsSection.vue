<template>
  <EditableChapSection
    enable-subtitle
    :title="tarifs.title"
    v-model:title-draft="formState.title"
    :subtitle="tarifs.subtitle"
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
        v-model:items="formState.items"
        :is-editing="isEditing"
        :is-saving="isSaving"
        :view-intro="tarifs.intro"
        :view-items="tarifs.items"
        :intro-placeholder="ui.copy.introPlaceholder"
        :add-label="ui.copy.addItem"
        @add="addItem"
      >
        <template #item="{ item, index: itemIndex }">
          <EditableChapListItem
            :is-editing="isEditing"
            :disabled="isSaving"
            :reorder-aria="`${ui.copy.reorderItemAria} ${itemIndex + 1}`"
            :remove-aria="`${ui.copy.removeItemAria} ${itemIndex + 1}`"
            @remove="removeItem(itemIndex)"
          >
            <span v-if="isEditing" :class="ui.editLine">
              <input
                v-model="item.label"
                type="text"
                :class="[ui.inlineInput, ui.labelInput]"
                :disabled="isSaving"
                :aria-label="ui.copy.labelAria"
                :placeholder="ui.copy.labelPlaceholder"
              />
              <span :class="ui.labelInput">:</span>
              <input
                v-model="item.amount"
                type="text"
                :class="[ui.inlineInput, ui.amountInput]"
                :disabled="isSaving"
                :aria-label="ui.copy.amountAria"
                :placeholder="ui.copy.amountPlaceholder"
              />
            </span>
            <template v-else>
              <span :class="ui.listMainElement">{{ item.label }} : </span>
              <span :class="ui.amountView">{{ item.amount }}</span>
            </template>
          </EditableChapListItem>
        </template>

        <template #footer>
          <div v-if="isEditing" ref="segmentsEl" :class="ui.segmentsList">
            <div
              v-for="(segment, segmentIndex) in formState.callout_segments"
              :key="segment.id"
              :class="ui.segmentRow"
            >
              <button
                type="button"
                class="callout-drag-handle"
                :class="ui.dragHandle"
                :aria-label="`${ui.copy.reorderSegmentAria} ${segmentIndex + 1}`"
                :disabled="isSaving"
              >
                <UIcon name="i-ph-dots-six-vertical-bold" />
              </button>
              <select
                v-model="segment.style"
                :class="ui.styleSelect"
                :disabled="isSaving"
                :aria-label="ui.copy.styleAria"
              >
                <option
                  v-for="styleOption in styleOptions"
                  :key="styleOption.value"
                  :value="styleOption.value"
                >
                  {{ styleOption.label }}
                </option>
              </select>
              <USwitch
                v-model="segment.insert_contact_email"
                size="sm"
                :disabled="isSaving"
                :label="ui.copy.contactEmail"
              />
              <input
                v-model="segment.text"
                type="text"
                :class="[ui.inlineInput, ui.segmentInput]"
                :disabled="isSaving || segment.insert_contact_email"
                :aria-label="ui.copy.segmentAria"
                :placeholder="
                  segment.insert_contact_email
                    ? contactEmail
                    : ui.copy.segmentPlaceholder
                "
              />
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="sm"
                icon="i-ph-trash-duotone"
                :aria-label="`${ui.copy.removeSegmentAria} ${segmentIndex + 1}`"
                :disabled="isSaving"
                @click="removeSegment(segmentIndex)"
              />
            </div>
            <div :class="ui.addRow">
              <UButton
                type="button"
                color="neutral"
                variant="outline"
                size="sm"
                icon="i-ph-plus-bold"
                :label="ui.copy.addSegment"
                :disabled="isSaving"
                @click="addSegment"
              />
            </div>
          </div>
          <p v-else-if="visibleCalloutSegments.length > 0">
            <template
              v-for="segment in visibleCalloutSegments"
              :key="segment.id"
            >
              <a
                v-if="segment.insert_contact_email"
                :href="`mailto:${contactEmail}`"
                :class="[segmentClass(segment), ui.emailLink]"
              >
                {{ contactEmail }}
              </a>
              <span v-else :class="segmentClass(segment)">
                {{ segment.text }}
              </span>
            </template>
          </p>
        </template>
      </StructuredListBody>
    </ContentTextWrapper>
  </EditableChapSection>
</template>

<script setup lang="ts">
import { useSortable } from "@vueuse/integrations/useSortable";
import ContentTextWrapper from "~/components/layout/ContentTextWrapper.vue";
import EditableChapListItem from "~/components/ui/EditableChapListItem.vue";
import EditableChapSection from "~/components/ui/EditableChapSection.vue";
import StructuredListBody from "~/components/website/StructuredListBody.vue";
import { useChapToast } from "~/composables/useChapToasts";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useTarifs } from "~/composables/useTarifs";
import { useZod } from "~/composables/useZod";
import {
  cloneTarifs,
  isCalloutSegmentVisible,
  parseTarifs,
  type Tarifs,
  type TarifsCalloutSegment,
  type TarifsCalloutStyle,
  type TarifsItem,
} from "~~/shared/website/tarifs.schema";

const styleOptions: { label: string; value: TarifsCalloutStyle }[] = [
  { label: "Normal", value: "plain" },
  { label: "Surligné", value: "highlight" },
  { label: "Mis en avant", value: "emphasis" },
];

const ui = {
  listMainElement: "text-default font-semibold",
  amountView: "text-primary-500 font-semibold",
  editLine: "flex flex-wrap items-baseline gap-x-1 gap-y-1",
  inlineInput:
    "min-w-[6ch] max-w-full bg-transparent border-0 border-b border-dashed border-muted px-0.5 py-0 leading-relaxed focus:outline-none focus:border-primary-500",
  labelInput: "font-semibold text-highlighted",
  amountInput: "text-primary-500 font-semibold min-w-[8ch]",
  segmentsList: "flex flex-col gap-2",
  segmentRow: "flex flex-wrap items-center gap-2",
  dragHandle:
    "inline-flex cursor-grab items-center text-muted active:cursor-grabbing disabled:cursor-not-allowed",
  styleSelect:
    "rounded-md border border-muted bg-transparent px-1.5 py-1 text-sm text-highlighted",
  segmentInput: "min-w-[12ch] flex-1 text-muted",
  addRow: "flex justify-center",
  emailLink:
    "text-primary-500 font-bold hover:underline hover:underline-offset-4",
  copy: {
    editAria: "Modifier les tarifs",
    reorderItemAria: "Réordonner le tarif",
    removeItemAria: "Supprimer le tarif",
    reorderSegmentAria: "Réordonner le segment",
    removeSegmentAria: "Supprimer le segment",
    labelAria: "Libellé",
    amountAria: "Montant",
    styleAria: "Style du segment",
    segmentAria: "Texte du segment",
    labelPlaceholder: "adultes",
    amountPlaceholder: "195 euros",
    introPlaceholder: "Introduction des tarifs",
    segmentPlaceholder: "Texte",
    contactEmail: "E-mail de contact",
    addItem: "Ajouter un tarif",
    addSegment: "Ajouter un segment",
  },
};

const { addToastError, addToastSuccess } = useChapToast();
const { getZodIssues } = useZod();
const { isAdmin, hydrateIfNeeded } = useAuthUser();
const { contactEmail } = await useSiteSettings();
const { tarifs, saveTarifs, isSaving, pending } = await useTarifs();

const isEditing = ref(false);
const formState = reactive<Tarifs>({
  title: "",
  subtitle: "",
  intro: "",
  items: [],
  callout_segments: [],
});

const segmentsEl = useTemplateRef<HTMLElement>("segmentsEl");
const formSegments = toRef(formState, "callout_segments");
let stopSortable: (() => void) | null = null;

const visibleCalloutSegments = computed((): TarifsCalloutSegment[] => {
  return tarifs.value.callout_segments.filter((segment) => {
    return isCalloutSegmentVisible(segment);
  });
});

const segmentClass = (segment: TarifsCalloutSegment): string | undefined => {
  if (segment.style === "highlight") {
    return "text-default bg-secondary/40";
  }

  if (segment.style === "emphasis") {
    return "text-primary-500";
  }

  return undefined;
};

const hydrateForm = (nextTarifs: Tarifs): void => {
  const cloned = cloneTarifs(nextTarifs);
  formState.title = cloned.title;
  formState.subtitle = cloned.subtitle;
  formState.intro = cloned.intro;
  formState.items = cloned.items;
  formState.callout_segments = cloned.callout_segments;
};

const enterEdit = (): void => {
  hydrateForm(tarifs.value);
  isEditing.value = true;
};

const cancelEdit = (): void => {
  stopSortable?.();
  stopSortable = null;
  hydrateForm(tarifs.value);
  isEditing.value = false;
};

const createEmptyTarifsItem = (): TarifsItem => {
  return {
    id: crypto.randomUUID(),
    label: "",
    amount: "",
  };
};

const createEmptyCalloutSegment = (): TarifsCalloutSegment => {
  return {
    id: crypto.randomUUID(),
    text: "",
    style: "plain",
    insert_contact_email: false,
  };
};

const addItem = (): void => {
  formState.items.push(createEmptyTarifsItem());
};

const removeItem = (itemIndex: number): void => {
  formState.items.splice(itemIndex, 1);
};

const addSegment = (): void => {
  formState.callout_segments.push(createEmptyCalloutSegment());
};

const removeSegment = (segmentIndex: number): void => {
  formState.callout_segments.splice(segmentIndex, 1);
};

const saveEdit = async (): Promise<void> => {
  let validatedTarifs: Tarifs;

  try {
    validatedTarifs = parseTarifs(formState);
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
    await saveTarifs(validatedTarifs);
    stopSortable?.();
    stopSortable = null;
    isEditing.value = false;
    addToastSuccess({
      title: "Tarifs enregistrés",
      description: "Les tarifs publics ont été mis à jour.",
    });
  } catch (submitError) {
    console.error(submitError);
    addToastError({
      title: "Échec de mise à jour",
      description: "Les tarifs n'ont pas pu être enregistrés.",
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
  const sortable = useSortable(segmentsEl, formSegments, {
    handle: ".callout-drag-handle",
    animation: 200,
    filter: "input, textarea, select, button:not(.callout-drag-handle)",
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
