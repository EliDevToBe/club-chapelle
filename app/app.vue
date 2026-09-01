<template>
  <UApp :locale="fr" :toaster="toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import type { ToasterProps } from "@nuxt/ui";
import { fr } from "@nuxt/ui/locale";
import { useAuthUser } from "./composables/useAuthUser";

const toaster: ToasterProps = {
  position: "top-right",
  disableSwipe: false,
  max: 2,
  progress: false,
};

const { hydrateIfNeeded } = useAuthUser();

try {
  await hydrateIfNeeded();
} catch {
  // Render as a visitor if the session cannot be resolved.
}
</script>
