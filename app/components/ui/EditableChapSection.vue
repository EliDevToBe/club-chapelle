<template>
  <ChapSection :is-main-section="isMainSection">
    <template #title>
      <input
        v-if="isEditing"
        v-model="titleDraft"
        type="text"
        :class="[titleClass, ui.inlineInput]"
        :disabled="isSaving"
        :aria-label="ui.copy.titleAria"
        :placeholder="titlePlaceholder"
      />
      <div v-else :class="titleClass">
        {{ title }}
      </div>
    </template>

    <template v-if="enableSubtitle" #description>
      <input
        v-if="isEditing"
        v-model="subtitleDraft"
        type="text"
        :class="[ui.description, ui.inlineInput]"
        :disabled="isSaving"
        :aria-label="ui.copy.subtitleAria"
        :placeholder="subtitlePlaceholder"
      />
      <p v-else-if="subtitle" :class="ui.description">
        {{ subtitle }}
      </p>
    </template>

    <template v-if="isAdmin && !isEditing" #title-actions>
      <div class="flex justify-center" :class="ui.editTrigger">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-ph-gear-duotone"
          :class="ui.editTrigger"
          :aria-label="editAria"
          :disabled="pending"
          @click="emit('enter-edit')"
        />
      </div>
    </template>

    <slot />

    <div v-if="isEditing" :class="ui.actions">
      <UButton
        color="neutral"
        variant="ghost"
        :label="ui.copy.cancel"
        :disabled="isSaving"
        @click="emit('cancel')"
      />
      <UButton
        color="primary"
        icon="i-ph-floppy-disk-duotone"
        :label="ui.copy.save"
        :loading="isSaving"
        :disabled="isSaving"
        @click="emit('save')"
      />
    </div>
  </ChapSection>
</template>

<script setup lang="ts">
import ChapSection from "~/components/ui/ChapSection.vue";

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    enableSubtitle?: boolean;
    isMainSection?: boolean;
    isEditing: boolean;
    isAdmin?: boolean;
    pending?: boolean;
    isSaving?: boolean;
    editAria: string;
    titlePlaceholder?: string;
    subtitlePlaceholder?: string;
  }>(),
  {
    subtitle: "",
    enableSubtitle: false,
    isMainSection: false,
    isAdmin: false,
    pending: false,
    isSaving: false,
    titlePlaceholder: "Titre",
    subtitlePlaceholder: "Sous-titre",
  },
);

const emit = defineEmits<{
  "enter-edit": [];
  cancel: [];
  save: [];
}>();

const titleDraft = defineModel<string>("titleDraft", { required: true });
const subtitleDraft = defineModel<string>("subtitleDraft", { default: "" });

const titleClass = computed(() => {
  if (props.isMainSection) {
    return ui.mainTitle;
  }

  return ui.sectionTitle;
});

const ui = {
  editTrigger:
    "opacity-0 transition-opacity duration-150 group-hover/title:opacity-100 group-focus-within/title:opacity-100 [@media(hover:none)]:opacity-100",
  inlineInput:
    "w-full min-w-0 bg-transparent border-0 border-b border-dashed border-muted px-0.5 py-0 leading-relaxed focus:outline-none focus:border-primary-500",
  mainTitle: "text-2xl font-semibold text-highlighted md:text-3xl",
  sectionTitle: "text-lg font-semibold text-highlighted md:text-2xl",
  description: "text-muted text-sm",
  actions: "flex justify-end gap-2 pt-2",
  copy: {
    titleAria: "Titre de la section",
    subtitleAria: "Sous-titre",
    cancel: "Annuler",
    save: "Enregistrer",
  },
};
</script>
