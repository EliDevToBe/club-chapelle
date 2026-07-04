<template>
  <div ref="anchorRef" class="w-full">
    <UInputDate
      v-model="calendarDateRange"
      range
      :disabled="disabled"
      :min-value="minDate"
      :is-date-unavailable="isDateBeforeMin"
      class="w-full text-sm md:text-base"
      fixed
      :ui="{
        segment: 'w-fit flex justify-center',

        separatorIcon: 'text-primary shrink-0 flex place-self-center',
        base: 'grid  grid-cols-[auto_auto_auto_auto_auto_2fr_auto_auto_auto_auto_auto]',
      }"
    >
      <template #leading>
        <UPopover
          :reference="popoverReference"
          :content="{ side: 'bottom', align: 'center', sideOffset: 8 }"
        >
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-calendar"
            aria-label="Sélectionner une plage de dates"
            class="px-0"
            :disabled="disabled"
          />

          <template #content>
            <UCalendar
              variant="subtle"
              v-model="calendarDateRange"
              range
              :number-of-months="2"
              :min-value="minDate"
              :is-date-unavailable="isDateBeforeMin"
              class="p-2"
            />
          </template>
        </UPopover>
      </template>

      <template #trailing>
        <div
          v-if="hasRangeValue"
          class="cursor-pointer text-secondary hover:text-secondary-500 flex justify-center items-center shrink-0"
          @click="onClearRange"
        >
          <UIcon name="i-ph-x-bold" class="size-4" />
        </div>
      </template>
    </UInputDate>
  </div>
</template>

<script setup lang="ts">
import type { CalendarDate, DateValue } from "@internationalized/date";

export type ChapCalendarDateRange = {
  start: CalendarDate;
  end: CalendarDate;
};

const props = defineProps<{
  disabled?: boolean;
  minDate?: CalendarDate;
}>();

const calendarDateRange = defineModel<ChapCalendarDateRange>();

const anchorRef = useTemplateRef("anchorRef");

const popoverReference = computed(() => {
  return anchorRef.value ?? undefined;
});

const hasRangeValue = computed(() => {
  return Boolean(
    calendarDateRange.value?.start || calendarDateRange.value?.end,
  );
});

const isDateBeforeMin = (date: DateValue): boolean => {
  if (!props.minDate) {
    return false;
  }
  return date.compare(props.minDate) < 0;
};

const onClearRange = (): void => {
  calendarDateRange.value = undefined;
};
</script>

<style scoped></style>
