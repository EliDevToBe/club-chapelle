<template>
  <section
    aria-labelledby="landing-partners-title"
    class="space-y-4 md:space-y-5"
  >
    <h2
      id="landing-partners-title"
      class="text-lg font-semibold text-highlighted md:text-xl"
    >
      Fédération et région
    </h2>
    <div
      class="flex flex-col gap-6 border-default border-t pt-6 md:flex-row md:items-center md:justify-start md:gap-10 md:pt-8"
    >
      <a
        href="https://www.ffta.fr/"
        target="_blank"
        rel="noopener noreferrer"
        class="focus-visible:ring-primary flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:outline-none"
      >
        <img
          src="~/assets/ffta-logo.svg"
          alt=""
          width="40"
          height="40"
          class="size-10 shrink-0"
          loading="lazy"
        />
        <span
          class="text-highlighted text-base font-medium underline-offset-4 hover:underline"
        >
          Fédération française de tir à l’arc (FFTA)
        </span>
      </a>
      <a
        href="https://www.tiralarcidf.com/"
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
          class="text-highlighted text-base font-medium underline-offset-4 hover:underline"
        >
          Comité régional Île-de-France de tir à l’arc
        </span>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang=""></style>
