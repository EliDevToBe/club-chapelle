<template>
  <ChapSection>
    <div
      class="flex flex-col sm:items-start gap-6 border-default border-t pt-6 md:flex-row md:items-center md:justify-around md:gap-10 md:pt-8"
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
          Fédération&nbsp;française&nbsp;de&nbsp;tir&nbsp;à&nbsp;l'arc (FFTA)
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
          Comité&nbsp;régional Île-de-France
        </span>
      </NuxtLink>

      <NuxtLink
        to="https://www.tiralarc75.fr/"
        target="_blank"
        rel="noopener noreferrer"
        class="focus-visible:ring-primary flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:outline-none"
      >
        <img
          src="https://image.jimcdn.com/app/cms/image/transf/dimension=368x2048:format=png/path/sbb8f48a2570a7cb2/image/i81628e94c40d3dd9/version/1765982888/image.png"
          alt=""
          width="40"
          height="40"
          class="size-10 shrink-0 bg-white rounded-full"
          loading="lazy"
        />
        <span
          class="text-base font-medium underline-offset-4 hover:underline hover:text-secondary"
        >
          Comité&nbsp;départemental Paris
        </span>
      </NuxtLink>
    </div>
  </ChapSection>
</template>

<script setup lang="ts">
import ChapSection from "~/components/ui/ChapSection.vue";
</script>

<style scoped lang=""></style>
