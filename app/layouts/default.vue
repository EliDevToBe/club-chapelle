<template>
  <div class="min-h-dvh flex flex-col">
    <AppSiteHeader />

    <UMain class="flex-1">
      <slot />
    </UMain>
  </div>
</template>

<script setup lang="ts">
import AppSiteHeader from "~/components/layout/AppSiteHeader.vue";
</script>
