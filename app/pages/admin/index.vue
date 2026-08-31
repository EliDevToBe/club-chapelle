<template>
  <ContentPageWrapper>
    <ChapSection
      title="Administration"
      description="Gérez le club et le site depuis un seul espace."
      :is-main-section="true"
    >
      <UTabs :items="tabs" default-value="club" class="w-full">
        <template #content="{ item }">
          <div
            v-if="item.value === 'club'"
            class="rounded-lg border border-default p-4"
          >
            <p class="text-sm text-muted">
              Les outils de gestion du club arriveront dans cette section.
            </p>
          </div>

          <WebsitePanel v-else />
        </template>
      </UTabs>
    </ChapSection>
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import WebsitePanel from "~/components/admin/WebsitePanel.vue";
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ChapSection from "~/components/ui/ChapSection.vue";

useHead({
  title: "Admin - Arc18",
});

const tabs = [
  {
    label: "Gestion du club",
    value: "club",
    icon: "i-ph-users-three-duotone",
  },
  {
    label: "Gestion du site",
    value: "website",
    icon: "i-ph-browser-duotone",
  },
] satisfies TabsItem[];
</script>
