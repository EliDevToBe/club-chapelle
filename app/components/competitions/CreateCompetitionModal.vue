<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div :class="ui.root">
        <div :class="ui.header">
          <span :class="ui.title">Nouvelle compétition</span>
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

        <div :class="[ui.body, 'gap-8 overflow-y-auto']">
          <div :class="ui.fields">
            <UFormField label="Titre" required>
              <ChapInput
                :class="competitionNameClass"
                v-model="name"
                placeholder="Nom de la compétition"
                :ui="{ base: 'w-full text-xl md:text-2xl leading-tight' }"
              />
            </UFormField>

            <UFormField label="Lieu">
              <ChapInput
                v-model="place"
                placeholder="Ville ou lieu"
                class="w-full"
              />
            </UFormField>

            <UFormField
              class="hidden sm:block"
              label="Date de début et fin"
              required
            >
              <ChapInputDateRange
                v-model:start-date="startDate"
                v-model:end-date="endDate"
              />
            </UFormField>

            <div :class="ui.subFields">
              <UFormField
                class="block sm:hidden"
                label="Date de début"
                required
              >
                <ChapInputDate
                  :class="startDate ? ui.validField : ''"
                  v-model="startDate"
                />
              </UFormField>

              <UFormField class="block sm:hidden" label="Date de fin" required>
                <ChapInputDate
                  :class="endDate && datesValid ? ui.validField : ''"
                  v-model="endDate"
                  :disabled="!startDate"
                  :min-date="startDate"
                />
              </UFormField>

              <UFormField label="Catégorie" required>
                <ChapSelectMenu
                  :class="[selectedCategory ? ui.validField : '', ui.field]"
                  :items="categoryItems"
                  v-model="selectedCategory"
                  placeholder="Salle ou extérieur"
                />
              </UFormField>

              <UFormField label="Type" required>
                <ChapSelectMenu
                  :class="[selectedType ? ui.validField : '', ui.field]"
                  :items="typeItems"
                  v-model="selectedType"
                  :placeholder="
                    !selectedCategory
                      ? 'Sélectionnez une catégorie avant'
                      : 'Type de compétition'
                  "
                  :disabled="!selectedCategory"
                />
              </UFormField>
            </div>

            <UFormField label="Prix (€)" required>
              <UInputNumber
                :class="price !== undefined && price >= 0 ? ui.validField : ''"
                v-model="price"
                :min="0"
                :step="0.1"
                class="w-full"
              />
            </UFormField>

            <UCheckbox
              indicator="end"
              v-model="isChampionship"
              label="Championnat ? (payé par le club)"
            />
          </div>
        </div>

        <div :class="ui.footer">
          <UButton
            :disabled="!canSubmit || isMutating"
            :loading="isMutating"
            label="Créer la compétition"
            @click="onCreateCompetition"
          />
        </div>
      </div>
    </template>

    <slot />
  </UModal>
</template>

<script setup lang="ts">
import type { CalendarDate } from "@internationalized/date";
import { useChapToast } from "~/composables/useChapToasts";
import { useCompetition } from "~/composables/useCompetition";
import { calendarDateToYmd } from "~/utils";
import {
  translateCompetitionCategory,
  translateCompetitionType,
} from "~/utils/translate";
import { allowedCompetitionTypesForCategory } from "~~/domain/competitions/competition.rules";
import type {
  CompetitionCategoryEnum,
  CompetitionTypeEnum,
} from "~~/shared/db-enums";
import ChapInput from "../ui/ChapInput.vue";
import ChapInputDate from "../ui/ChapInputDate.vue";
import ChapInputDateRange from "../ui/ChapInputDateRange.vue";
import ChapSelectMenu from "../ui/ChapSelectMenu.vue";

const emit = defineEmits<{
  "competition-created": [];
}>();

type CategoryItem = {
  label: string;
  value: CompetitionCategoryEnum;
};
type TypeItem = { label: string; value: CompetitionTypeEnum };

const isOpen = defineModel<boolean>("open");

const name = ref("");
const place = ref<string>();
const startDate = shallowRef<CalendarDate>();
const endDate = shallowRef<CalendarDate>();

const selectedCategory = ref<CompetitionCategoryEnum>();
const selectedType = ref<CompetitionTypeEnum>();
const isChampionship = ref(false);
const price = ref<number>();

const { create, isMutating } = useCompetition();
const { addToastError, addToastSuccess } = useChapToast();

const ui = {
  root: "p-4 flex flex-col gap-4 md:gap-8 overflow-y-auto",
  header: "flex justify-between items-center",
  body: "flex flex-col gap-4 md:gap-6",
  fields: "flex flex-col gap-4 md:gap-6",
  subFields: "flex flex-col gap-4 md:gap-6 sm:grid sm:grid-cols-2",
  footer: "flex justify-end",

  title: "text-lg font-semibold leading-tight sticky top-0",
  field: "w-full",
  validField: "ring-1 ring-success-500/60 rounded-md",
};

const competitionNameClass = computed(() => {
  return [name.value.trim() ? ui.validField : "", "w-full"].join(" ");
});

const categoryItems: CategoryItem[] = (["indoor", "outdoor"] as const).map(
  (category) => {
    return {
      label: translateCompetitionCategory[category],
      value: category,
    };
  },
);

const typeItems = computed((): TypeItem[] => {
  if (!selectedCategory.value) {
    return [];
  }
  return allowedCompetitionTypesForCategory(selectedCategory.value).map(
    (type) => {
      return {
        label: translateCompetitionType[type],
        value: type,
      };
    },
  );
});

const isEndBeforeStart = (start: CalendarDate, end: CalendarDate): boolean => {
  const startYmd = calendarDateToYmd(start);
  const endYmd = calendarDateToYmd(end);
  if (!startYmd || !endYmd) {
    return false;
  }
  return endYmd < startYmd;
};

const ensureEndDateOnOrAfterStart = (): void => {
  if (
    startDate.value &&
    endDate.value &&
    isEndBeforeStart(startDate.value, endDate.value)
  ) {
    endDate.value = startDate.value;
  }
};

const datesValid = computed(() => {
  if (!startDate.value || !endDate.value) {
    return false;
  }
  const startYmd = calendarDateToYmd(startDate.value);
  const endYmd = calendarDateToYmd(endDate.value);
  if (!startYmd || !endYmd) {
    return false;
  }
  return endYmd >= startYmd;
});

const canSubmit = computed(() => {
  if (!name.value.trim() || !datesValid.value) {
    return false;
  }
  if (!selectedCategory.value || !selectedType.value) {
    return false;
  }
  if (price.value === undefined || price.value < 0) {
    return false;
  }
  return true;
});

const formatPrice = (amount: number): string => {
  return amount.toFixed(2);
};

const resetForm = (): void => {
  name.value = "";
  place.value = undefined;
  startDate.value = undefined;
  endDate.value = undefined;
  selectedCategory.value = undefined;
  selectedType.value = undefined;
  isChampionship.value = false;
  price.value = undefined;
};

const onCreateCompetition = async (): Promise<void> => {
  if (
    !canSubmit.value ||
    !startDate.value ||
    !endDate.value ||
    !selectedCategory.value ||
    !selectedType.value ||
    price.value === undefined
  ) {
    return;
  }

  const startYmd = calendarDateToYmd(startDate.value);
  const endYmd = calendarDateToYmd(endDate.value);
  if (!startYmd || !endYmd) {
    return;
  }

  try {
    await create({
      name: name.value.trim(),
      start_date: startYmd,
      end_date: endYmd,
      place: place.value?.trim() || null,
      price: formatPrice(price.value),
      category: selectedCategory.value,
      type: selectedType.value,
      is_championship: isChampionship.value,
    });

    addToastSuccess({
      title: "Compétition créée",
    });
    resetForm();
    isOpen.value = false;
    emit("competition-created");
  } catch {
    addToastError({
      description: "Impossible de créer la compétition. Réessayez plus tard.",
    });
  }
};

watch(startDate, (nextStart) => {
  if (!nextStart) {
    return;
  }
  if (!endDate.value) {
    endDate.value = nextStart;
    return;
  }
  ensureEndDateOnOrAfterStart();
});

watch(endDate, (nextEnd) => {
  if (!nextEnd || !startDate.value) {
    return;
  }
  if (isEndBeforeStart(startDate.value, nextEnd)) {
    endDate.value = startDate.value;
  }
});

watch(selectedCategory, (category) => {
  if (!category || !selectedType.value) {
    return;
  }
  const allowed = allowedCompetitionTypesForCategory(category);
  if (!allowed.includes(selectedType.value)) {
    selectedType.value = undefined;
  }
});

watch(isOpen, (open) => {
  if (!open) {
    resetForm();
  }
});
</script>

<style scoped lang=""></style>
