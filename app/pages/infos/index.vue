<template>
  <ContentPageWrapper>
    <section></section>
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";

definePageMeta({
  layout: "default",
});

const route = useRoute();
</script>
