<template>
  <div class="flex items-center gap-1" v-if="!isEditing">
    <span :class="`text-${size} font-medium text-highlighted`">
      {{ label }}</span
    >
  </div>

  <template v-else>
    <form
      class="flex items-center gap-1 w-full"
      @submit.prevent="emit('update:label', localEditingLabel)"
    >
      <UInput
        :autofocus="true"
        class="w-full"
        :size="size"
        v-model="localEditingLabel"
      />
    </form>
  </template>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    isEditing: boolean;
    label: string;
    editingLabel?: string;
    size?: "sm" | "md" | "lg";
  }>(),
  { isEditing: false, size: "md" },
);

const emit = defineEmits<{
  "update:label": [string];
}>();

const localEditingLabel = defineModel<string>("currentLabel", { default: "" });

watch(
  () => props.isEditing,
  (value) => {
    if (value) {
      localEditingLabel.value = props.editingLabel ?? props.label;
    }
  },
);

onMounted(() => {
  localEditingLabel.value = props.editingLabel ?? props.label;
});
</script>

<style scoped lang=""></style>
