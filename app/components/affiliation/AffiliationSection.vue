<template>
  <ChapSection>
    <div
      class="flex flex-col items-center sm:items-start gap-6 border-default border-t pt-6 md:flex-row md:items-center md:justify-around md:gap-10 md:pt-8"
    >
      <NuxtLink
        to="https://www.ffta.fr/"
        target="_blank"
        rel="noopener noreferrer"
        class="focus-visible:ring-primary flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:outline-none"
      >
        <img
          src="~/assets/ffta-logo.svg"
          alt=""
          width="40"
          height="40"
          class="size-10 shrink-0 bg-white rounded-full"
          loading="lazy"
        />
        <span
          class="text-base font-medium underline-offset-4 hover:underline hover:text-secondary"
        >
          Fédération française de tir à l’arc (FFTA)
        </span>
      </NuxtLink>
      <NuxtLink
        to="https://www.tiralarcidf.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="focus-visible:ring-primary flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:outline-none"
      >
        <img
          src="https://www.tiralarcidf.com/favicon.ico"
          alt=""
          width="40"
          height="40"
          class="size-10 shrink-0"
          loading="lazy"
        />
        <span
          class="text-base font-medium underline-offset-4 hover:underline hover:text-secondary"
        >
          Comité régional Île-de-France de tir à l’arc
        </span>
      </NuxtLink>
    </div>
  </ChapSection>
</template>

<script setup lang="ts">
import ChapSection from "~/components/ui/ChapSection.vue";
</script>

<style scoped lang=""></style>
