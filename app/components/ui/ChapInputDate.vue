<template>
  <UInputDate
    ref="dateInputRef"
    v-model="calendarDate"
    class="w-full sm:min-w-45"
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
        />

        <template #content>
          <UCalendar v-model="calendarDate" class="p-2" />
        </template>
      </UPopover>
    </template>

    <template #trailing v-if="calendarDate">
      <div
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

const calendarDate = defineModel<CalendarDate>();

const dateInputRef = useTemplateRef("dateInputRef");
</script>

<style scoped lang=""></style>
