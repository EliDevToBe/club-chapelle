<template>
  <div :class="ui.root">
    <div :class="ui.formSide">
      <div :class="ui.formInner">
        <slot />
      </div>
    </div>

    <div :class="ui.crestSide" aria-hidden="true">
      <img
        src="/club-logo.svg"
        alt=""
        width="380"
        height="515"
        :class="ui.crest"
        decoding="async"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/** Login / password pages: form on the light side, black crest panel on desktop (echoes the footer). */
const ui = {
  root: "grid grid-cols-1 lg:grid-cols-2 lg:min-h-[calc(100dvh-var(--ui-header-height))]",
  formSide:
    "flex items-center justify-center px-(--container-gutter) py-16 lg:py-24",
  formInner: "w-full max-w-md",
  crestSide: "dark hidden lg:flex items-center justify-center bg-default",
  crest: "w-64 xl:w-80 h-auto",
};
</script>
