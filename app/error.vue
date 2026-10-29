<template>
  <UApp :locale="fr">
    <NuxtLayout>
      <SiteSection tone="base">
        <div :class="ui.body">
          <p :class="ui.code" aria-hidden="true">{{ backgroundCode }}</p>

          <h1 :class="MAIN_SECTION_TITLE">{{ headline }}</h1>

          <p :class="ui.subLine">{{ subLine }}</p>

          <p v-if="statusLabel" :class="ui.status">{{ statusLabel }}</p>

          <div class="pt-4">
            <ChapButton label="Retour à l'accueil" @click="goHome" />
          </div>
        </div>
      </SiteSection>
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { fr } from "@nuxt/ui/locale";
import type { NuxtError } from "#app";
import SiteSection from "~/components/layout/SiteSection.vue";
import ChapButton from "~/components/ui/ChapButton.vue";
import { MAIN_SECTION_TITLE } from "~/components/ui/style";
import { useAuthUser } from "~/composables/useAuthUser";

const error = useError();

const ui = {
  body: "flex min-h-[50dvh] flex-col justify-center gap-4",
  code: "font-serif font-light leading-none text-primary-500 text-[clamp(6rem,20vw,13rem)]",
  subLine: "text-lg text-muted",
  status: "text-sm text-dimmed",
};

const { hydrateIfNeeded } = useAuthUser();

try {
  await hydrateIfNeeded();
} catch {
  // Render as a visitor if the session cannot be resolved.
}

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
