<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div :class="ui.root">
        <div :class="[ui.body, 'gap-8']">
          <div :class="ui.header">
            <span :class="ui.title">Sélectionne ou crée un·e archer·ère</span>
            <UButton
              icon="i-ph-x-bold"
              variant="link"
              color="secondary"
              class="size-4"
              size="sm"
              @click="
                () => {
                  isOpen = false;
                }
              "
            />
          </div>

          <div :class="ui.fields">
            <UFormField label="Archer·ère" required>
              <ArcherSelect
                :class="selectedArcherId ? ui.validField : ''"
                v-model="selectedArcherId"
              />
            </UFormField>

            <div :class="ui.subFields">
              <UFormField label="Pour quel départ ?" required>
                <ChapSelectMenu
                  :class="[
                    selectedSession !== undefined ? ui.validField : '',
                    ui.field,
                  ]"
                  :items="sessions"
                  v-model="selectedSession"
                  placeholder="Sélectionne un départ"
                />
              </UFormField>

              <UFormField label="Distance" required>
                <ChapSelectMenu
                  :class="[selectedDistance ? ui.validField : '', ui.field]"
                  :items="distanceItems"
                  v-model="selectedDistance"
                  placeholder="Sélectionne une distance"
                />
              </UFormField>

              <UFormField v-if="targetRequired" label="Cible" required>
                <ChapSelectMenu
                  :class="[selectedTarget ? ui.validField : '', ui.field]"
                  :items="targetItems"
                  v-model="selectedTarget"
                  placeholder="Sélectionne une cible"
                />
              </UFormField>
            </div>
          </div>
        </div>

        <div :class="ui.footer">
          <UButton
            :disabled="!canSubmit || isMutating"
            :loading="isMutating"
            label="Placer sur la compétition"
            @click="onPlaceOnCompetition"
          />
        </div>
      </div>
    </template>

    <slot />
  </UModal>
</template>

<script setup lang="ts">
import { useChapToast } from "~/composables/useChapToasts";
import { useParticipation } from "~/composables/useParticipation";
import { translateDistance, translateTarget } from "~/utils/translate";
import {
  ALLOWED_TARGETS,
  allowedDistancesForCompetition,
  isTargetRequiredForCompetition,
} from "~~/domain/participations/participation.rules";
import type {
  CompetitionCategoryEnum,
  CompetitionTypeEnum,
  DistanceEnum,
  SessionEnum,
  TargetEnum,
} from "~~/shared/db-enums";
import ChapSelectMenu from "../ui/ChapSelectMenu.vue";

const props = defineProps<{
  competitionId: string;
  competitionCategory: CompetitionCategoryEnum;
  competitionType: CompetitionTypeEnum;
}>();

const emit = defineEmits<{
  "participation-created": [];
}>();

type SessionItem = { label: string; value: SessionEnum | null; icon?: string };
type DistanceItem = { label: string; value: DistanceEnum };
type TargetItem = { label: string; value: TargetEnum };

const isOpen = defineModel<boolean>("open");
const selectedArcherId = ref<string>();
const selectedSession = ref<SessionEnum | null>();
const selectedDistance = ref<DistanceEnum>();
const selectedTarget = ref<TargetEnum>();

const { create, isMutating } = useParticipation();
const { addToastError, addToastSuccess } = useChapToast();

const ui = {
  root: "p-4 flex flex-col gap-8",
  header: "flex justify-between items-center",
  body: "flex flex-col gap-6",
  fields: "flex flex-col gap-6",
  subFields: "flex flex-col gap-6 sm:grid sm:grid-cols-2",
  footer: "flex justify-end",

  title: "text-lg font-semibold leading-tight",
  field: "w-full",
  validField: "ring-1 ring-success-500/60 rounded-md",
};

const sessions: SessionItem[] = [
  { label: "Départ 1", value: "session_1", icon: "i-ph-dot" },
  { label: "Départ 2", value: "session_2", icon: "i-ph-dot" },
  { label: "Départ 3", value: "session_3", icon: "i-ph-dot" },
  { label: "Départ 4", value: "session_4", icon: "i-ph-dot" },
  {
    label: "Indécis",
    value: null,
    icon: "i-ph-question-mark",
  },
];

const targetRequired = computed(() => {
  return isTargetRequiredForCompetition(
    props.competitionCategory,
    props.competitionType,
  );
});

const distanceItems = computed((): DistanceItem[] => {
  return allowedDistancesForCompetition(
    props.competitionCategory,
    props.competitionType,
  ).map((distance) => {
    return {
      label: translateDistance[distance],
      value: distance,
    };
  });
});

const targetItems = computed((): TargetItem[] => {
  return ALLOWED_TARGETS.map((target) => {
    return {
      label: translateTarget[target],
      value: target,
    };
  });
});

const canSubmit = computed(() => {
  if (
    !selectedArcherId.value ||
    selectedSession.value === undefined ||
    !selectedDistance.value
  ) {
    return false;
  }
  if (targetRequired.value && !selectedTarget.value) {
    return false;
  }
  return true;
});

const resetForm = (): void => {
  selectedArcherId.value = undefined;
  selectedSession.value = undefined;
  selectedDistance.value = undefined;
  selectedTarget.value = undefined;
};

const onPlaceOnCompetition = async (): Promise<void> => {
  if (
    !canSubmit.value ||
    !selectedArcherId.value ||
    selectedSession.value === undefined ||
    !selectedDistance.value
  ) {
    return;
  }

  try {
    await create({
      archer_id: selectedArcherId.value,
      competition_id: props.competitionId,
      distance: selectedDistance.value,
      target: targetRequired.value ? (selectedTarget.value ?? null) : null,
      session: selectedSession.value,
      registration_status: "to_register",
      payment_status: "to_pay",
      payer: "archer",
    });

    addToastSuccess({
      title: `Placé·e sur la compétition`,
    });
    resetForm();
    isOpen.value = false;
    emit("participation-created");
  } catch {
    addToastError({
      description:
        "Impossible de placer l’archer·ère sur la compétition. Réessayez plus tard.",
    });
  }
};

watch(isOpen, (open) => {
  if (!open) {
    resetForm();
  }
});
</script>

<style scoped lang=""></style>
