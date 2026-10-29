<template>
  <div class="min-h-dvh flex flex-col">
    <AppSiteHeader />

    <UMain class="flex-1 min-h-0">
      <slot />
    </UMain>

    <AppSiteFooter :compact="route.meta.compactFooter === true" />
  </div>
</template>

<script setup lang="ts">
import AppSiteFooter from "~/components/layout/AppSiteFooter.vue";
import AppSiteHeader from "~/components/layout/AppSiteHeader.vue";

const route = useRoute();
</script>
