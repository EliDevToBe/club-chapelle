<template>
  <UInput
    v-model="model"
    :type="showPassword ? 'text' : 'password'"
    :autocomplete="autocomplete"
    :disabled="disabled"
    :class="['chap-password-input', inputClass]"
  >
    <template #trailing>
      <button
        type="button"
        class="flex shrink-0 items-center justify-center text-muted hover:text-secondary disabled:pointer-events-none disabled:opacity-50"
        :aria-label="
          showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
        "
        :disabled="disabled"
        @click="showPassword = !showPassword"
      >
        <UIcon
          :name="showPassword ? 'i-ph-eye-slash-duotone' : 'i-ph-eye-duotone'"
          class="size-4"
        />
      </button>
    </template>
  </UInput>
</template>

<script setup lang="ts">
defineProps<{
  autocomplete?: string;
  disabled?: boolean;
  inputClass?: string;
}>();

const ui = {};

const model = defineModel<string>({ default: "" });
const showPassword = ref(false);
</script>

<style>
/* Hide the password reveal button in Edge */
.chap-password-input input::-ms-reveal {
  display: none;
}
</style>
