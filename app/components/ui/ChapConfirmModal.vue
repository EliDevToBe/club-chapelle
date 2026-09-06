<template>
  <UModal :title="title" :description="description" v-model:open="isOpen">
    <slot />

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          icon="i-ph-x-circle-duotone"
          label="Annuler"
          variant="outline"
          color="secondary"
          @click="isOpen = false"
        />
        <UButton
          color="primary"
          icon="i-ph-check-circle-duotone"
          label="Confirmer"
          @click="
            () => {
              $emit('onConfirm');
              isOpen = false;
            }
          "
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: "Êtes-vous sûr ?",
  },
);

defineEmits<{
  onConfirm: [];
}>();

const isOpen = defineModel<boolean>("open", { default: false });
</script>
