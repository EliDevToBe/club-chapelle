<template>
  <div class="mx-auto max-w-5xl px-4 py-8 md:py-12">
    <p class="text-muted font-mono text-sm md:text-base">{{ route.name }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const route = useRoute();
</script>
