<template>
  <div class="min-h-dvh flex flex-col">
    <AppSiteHeader />

    <UMain class="flex-1">
      <slot />
    </UMain>

    <AppSiteFooter />
  </div>
</template>

<script setup lang="ts">
import AppSiteFooter from "~/components/layout/AppSiteFooter.vue";
import AppSiteHeader from "~/components/layout/AppSiteHeader.vue";
</script>
