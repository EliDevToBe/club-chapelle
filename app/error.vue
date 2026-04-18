<template>
  <div
    class="relative isolate min-h-dvh flex flex-col overflow-hidden bg-default"
  >
    <ChapWatermark>{{ backgroundCode }}</ChapWatermark>

    <div class="relative z-10 flex flex-1 flex-col justify-center">
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
              class="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";
import ChapWatermark from "~/components/ui/ChapWatermark.vue";

const error = useError();

const ui = {
  backgroundCode: [
    "select-none font-bold tabular-nums leading-none tracking-tighter",
    "text-highlighted/[0.07] dark:text-highlighted/[0.11]",
    "text-[min(36rem,58vw)] sm:text-[min(44rem,62vw)]",
  ],
  shell: [
    "flex max-w-5xl flex-col",
    "mx-auto px-4 py-8 md:py-12",
    "text-muted",
  ],
  body: "flex flex-col gap-3 text-base leading-relaxed md:text-lg",
};

const err = computed(() => error.value as NuxtError | undefined);

const errorStatus = computed(
  () => err.value?.status ?? (err.value as { status?: number })?.status,
);

const backgroundCode = computed(() => {
  const code = errorStatus.value;
  return code !== null ? String(code) : "?";
});

const headline = computed(() => {
  const code = errorStatus.value;
  if (code === 404) {
    return "Page introuvable";
  }
  return "Une erreur s'est produite";
});

const subLine = computed(() => {
  const code = errorStatus.value;
  if (code === 404) {
    return "La page demandée n'existe pas ou a été déplacée.";
  }
  return "Veuillez réessayer plus tard ou revenir à l'accueil.";
});

const statusLabel = computed(() => {
  const code = errorStatus.value;
  if (code === null || code === 404) {
    return null;
  }
  return `Code ${code}`;
});

const goHome = () => {
  clearError({ redirect: "/" });
};
</script>
