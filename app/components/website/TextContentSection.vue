<template>
  <EditableChapSection
    enable-subtitle
    :title="textSection.title"
    v-model:title-draft="formState.title"
    :subtitle="textSection.subtitle"
    v-model:subtitle-draft="formState.subtitle"
    :is-main-section="isMainSection"
    :is-editing="isEditing"
    :is-admin="isAdmin === true"
    :pending="pending"
    :is-saving="isSaving"
    :edit-aria="ui.copy.editAria"
    @enter-edit="enterEdit"
    @cancel="cancelEdit"
    @save="saveEdit"
  >
    <ContentTextWrapper :class="muted ? 'text-muted' : undefined">
      <div
        v-if="isEditing"
        ref="paragraphsEl"
        :class="ui.paragraphsList"
      >
        <div
          v-for="(paragraph, paragraphIndex) in formState.paragraphs"
          :key="paragraph.id"
          :class="ui.paragraphRow"
        >
          <button
            type="button"
            class="section-drag-handle"
            :class="ui.dragHandle"
            :aria-label="`${ui.copy.reorderAria} ${paragraphIndex + 1}`"
            :disabled="isSaving"
          >
            <UIcon name="i-ph-dots-six-vertical-bold" />
          </button>
          <UTextarea
            v-model="paragraph.text"
            :rows="2"
            :class="ui.paragraphInput"
            :disabled="isSaving"
            :placeholder="ui.copy.paragraphPlaceholder"
            autoresize
            :ui="{
              base: 'text-base!',
            }"
          />
          <UButton
            type="button"
            color="error"
            variant="ghost"
            size="sm"
            icon="i-ph-trash-duotone"
            :aria-label="`${ui.copy.removeAria} ${paragraphIndex + 1}`"
            :disabled="isSaving || formState.paragraphs.length <= 1"
            @click="removeParagraph(paragraphIndex)"
          />
        </div>
      </div>
      <template v-else>
        <p
          v-for="(paragraph, paragraphIndex) in textSection.paragraphs"
          :key="`paragraph-${paragraphIndex}`"
        >
          {{ paragraph }}
        </p>
      </template>

      <div v-if="isEditing" :class="ui.addRow">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-ph-plus-bold"
          :label="ui.copy.addParagraph"
          :disabled="isSaving"
          @click="addParagraph"
        />
      </div>
    </ContentTextWrapper>
  </EditableChapSection>
</template>

<script setup lang="ts">
import { useSortable } from "@vueuse/integrations/useSortable";
import ContentTextWrapper from "~/components/layout/ContentTextWrapper.vue";
import EditableChapSection from "~/components/ui/EditableChapSection.vue";
import { useChapToast } from "~/composables/useChapToasts";
import { useTextSection } from "~/composables/useTextSection";
import { useZod } from "~/composables/useZod";
import {
  cloneTextSection,
  parseTextSection,
  type TextSection,
} from "~~/shared/website/text-section.schema";
import type { TextSectionKey } from "~~/shared/website/website-config.keys";

type ParagraphDraft = {
  id: string;
  text: string;
};

type TextSectionFormState = {
  title: string;
  subtitle: string;
  paragraphs: ParagraphDraft[];
};

const props = withDefaults(
  defineProps<{
    sectionKey: TextSectionKey;
    isMainSection?: boolean;
    muted?: boolean;
  }>(),
  {
    isMainSection: false,
    muted: false,
  },
);

const ui = {
  paragraphsList: "flex flex-col gap-3",
  paragraphRow: "flex items-start gap-2",
  dragHandle:
    "mt-1 inline-flex cursor-grab items-center text-muted active:cursor-grabbing disabled:cursor-not-allowed",
  paragraphInput: "w-full min-w-0 bg-transparent text-base md:text-lg",
  addRow: "flex justify-center",
  copy: {
    editAria: "Modifier la section",
    reorderAria: "Réordonner le paragraphe",
    removeAria: "Supprimer le paragraphe",
    paragraphPlaceholder: "Paragraphe",
    addParagraph: "Ajouter un paragraphe",
  },
};

const { addToastError, addToastSuccess } = useChapToast();
const { getZodIssues } = useZod();
const { isAdmin, hydrateIfNeeded } = useAuthUser();
const { textSection, saveTextSection, isSaving, pending } = await useTextSection(
  props.sectionKey,
);

const isEditing = ref(false);
const formState = reactive<TextSectionFormState>({
  title: "",
  subtitle: "",
  paragraphs: [],
});

const paragraphsEl = useTemplateRef<HTMLElement>("paragraphsEl");
const formParagraphs = toRef(formState, "paragraphs");
let stopSortable: (() => void) | null = null;

const createParagraphDraft = (text = ""): ParagraphDraft => {
  return {
    id: crypto.randomUUID(),
    text,
  };
};

const toFormParagraphs = (section: TextSection): ParagraphDraft[] => {
  return cloneTextSection(section).paragraphs.map((paragraph) => {
    return createParagraphDraft(paragraph);
  });
};

const hydrateForm = (section: TextSection): void => {
  const cloned = cloneTextSection(section);
  formState.title = cloned.title;
  formState.subtitle = cloned.subtitle;
  formState.paragraphs = toFormParagraphs(cloned);
};

const enterEdit = (): void => {
  hydrateForm(textSection.value);
  isEditing.value = true;
};

const cancelEdit = (): void => {
  stopSortable?.();
  stopSortable = null;
  hydrateForm(textSection.value);
  isEditing.value = false;
};

const addParagraph = (): void => {
  formState.paragraphs.push(createParagraphDraft());
};

const removeParagraph = (paragraphIndex: number): void => {
  if (formState.paragraphs.length <= 1) {
    return;
  }

  formState.paragraphs.splice(paragraphIndex, 1);
};

const saveEdit = async (): Promise<void> => {
  let validatedSection: TextSection;

  try {
    validatedSection = parseTextSection({
      title: formState.title,
      subtitle: formState.subtitle,
      paragraphs: formState.paragraphs.map((paragraph) => {
        return paragraph.text;
      }),
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
    await saveTextSection(validatedSection);
    stopSortable?.();
    stopSortable = null;
    isEditing.value = false;
    addToastSuccess({
      title: "Section enregistrée",
      description: "Le contenu public a été mis à jour.",
    });
  } catch (submitError) {
    console.error(submitError);
    addToastError({
      title: "Échec de mise à jour",
      description: "La section n'a pas pu être enregistrée.",
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
  const sortable = useSortable(paragraphsEl, formParagraphs, {
    handle: ".section-drag-handle",
    animation: 200,
    filter: "input, textarea, button:not(.section-drag-handle)",
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
