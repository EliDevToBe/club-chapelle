<template>
  <div class="flex flex-col gap-3">
    <FeatureManagementAccordion v-if="isDeveloper" />
    <PictureManagementAccordion />
  </div>
</template>

<script setup lang="ts">
import FeatureManagementAccordion from "~/components/admin/FeatureManagementAccordion.vue";
import PictureManagementAccordion from "~/components/admin/PictureManagementAccordion.vue";

const { isDeveloper } = useAuthUser();
</script>
