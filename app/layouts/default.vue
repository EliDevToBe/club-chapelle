<template>
  <div class="min-h-dvh flex flex-col">
    <a href="#main-content" :class="ui.skipLink">Aller au contenu</a>

    <AppSiteHeader />

    <UMain id="main-content" tabindex="-1" class="flex-1 min-h-0 outline-none">
      <slot />
    </UMain>

    <AppSiteFooter :compact="route.meta.compactFooter === true" />
  </div>
</template>

<script setup lang="ts">
import AppSiteFooter from "~/components/layout/AppSiteFooter.vue";
import AppSiteHeader from "~/components/layout/AppSiteHeader.vue";

const route = useRoute();

const ui = {
  skipLink: [
    "sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100]",
    "focus:bg-primary-500 focus:px-4 focus:py-2 focus:font-label focus:font-bold focus:uppercase focus:text-arc-grey-950",
  ],
};
</script>
