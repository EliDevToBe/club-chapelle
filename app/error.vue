<template>
  <div class="min-h-dvh flex flex-col bg-default">
    <div class="flex flex-1 flex-col justify-center">
      <div :class="ui.shell">
        <div :class="ui.body">
          <h1 class="text-2xl font-semibold text-highlighted md:text-3xl">
            {{ headline }}
          </h1>

          <p class="text-muted">
            {{ subLine }}
          </p>

          <div v-if="statusLabel" class="text-sm text-dimmed">
            {{ statusLabel }}
          </div>

          <div class="pt-2">
            <UButton
              color="primary"
              size="lg"
              label="Retour à l'accueil"
              @click="goHome"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const error = useError();

const ui = {
  shell: [
    "flex  max-w-5xl flex-col",
    "mx-auto px-4 py-8 md:py-12",
    "text-muted",
  ],
  body: "flex flex-col gap-3 text-base leading-relaxed md:text-lg",
};

const err = computed(() => error.value as NuxtError | undefined);

const headline = computed(() => {
  const code = err.value?.status;
  if (code === 404) {
    return "Page introuvable";
  }
  return "Une erreur s'est produite";
});

const subLine = computed(() => {
  const code = err.value?.status;
  if (code === 404) {
    return "La page demandée n'existe pas ou a été déplacée.";
  }
  return "Veuillez réessayer plus tard ou revenir à l'accueil.";
});

const statusLabel = computed(() => {
  const code = err.value?.status;
  if (code == null || code === 404) {
    return null;
  }
  return `Code ${code}`;
});

const goHome = () => {
  clearError({ redirect: "/" });
};
</script>
