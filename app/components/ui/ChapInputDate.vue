<template>
  <UInputDate
    ref="dateInputRef"
    v-model="calendarDate"
    :disabled="disabled"
    class="w-full sm:min-w-40 text-sm md:text-base"
  >
    <template #leading>
      <UPopover :reference="dateInputRef?.inputsRef[3]?.$el">
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-calendar"
          aria-label="Sélectionner une date"
          class="px-0"
          :disabled="disabled"
        />

        <template #content>
          <UCalendar
            variant="subtle"
            v-model="calendarDate"
            :min-date="minDate"
            :is-date-disabled="(date) => (minDate && date < minDate) || false"
            class="p-2"
          />
        </template>
      </UPopover>
    </template>

    <template #trailing>
      <div
        v-if="calendarDate"
        class="cursor-pointer text-secondary hover:text-secondary-500 flex justify-center items-center shrink-0"
        @click="calendarDate = undefined"
      >
        <UIcon name="i-ph-x-bold" class="size-4" />
      </div>
    </template>
  </UInputDate>
</template>

<script setup lang="ts">
import type { CalendarDate } from "@internationalized/date";

defineProps<{
  disabled?: boolean;
  minDate?: CalendarDate;
  withRange?: boolean;
}>();

const calendarDate = defineModel<CalendarDate>();

const dateInputRef = useTemplateRef("dateInputRef");
</script>

<style scoped lang=""></style>
