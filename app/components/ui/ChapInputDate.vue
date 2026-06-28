<template>
  <UInputDate ref="dateInputRef" v-model="calendarDate" class="w-full sm:w-44">
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
      <UButton
        color="secondary"
        variant="link"
        size="sm"
        icon="i-ph-x-bold"
        aria-label="Effacer la date"
        class="px-0"
        @click="calendarDate = undefined"
      />
    </template>
  </UInputDate>
</template>

<script setup lang="ts">
import type { CalendarDate } from "@internationalized/date";

const calendarDate = defineModel<CalendarDate>();

const dateInputRef = useTemplateRef("dateInputRef");
</script>

<style scoped lang=""></style>
