<template>
  <div :class="ui.band" aria-hidden="true">
    <UMarquee :repeat="4" :overlay="false" :ui="ui.marquee">
      <span v-for="index in WORDS_PER_REPEAT" :key="index" :class="ui.word">
        Contact
      </span>
    </UMarquee>
  </div>
</template>

<script setup lang="ts">
const WORDS_PER_REPEAT = 6;

const ui = {
  band: "relative h-15 overflow-hidden flex items-center bg-primary-500 text-white",
  marquee: {
    root: "[--duration:40s] [--gap:--spacing(6)]",
    content: "motion-reduce:[animation-play-state:paused]",
  },
  word: [
    "font-serif font-normal uppercase leading-none text-[2.75rem]",
    // All-caps text has no descenders: trim the line box to cap height so it centres optically.
    "[text-box:trim-both_cap_alphabetic]",
    // Firefox lacks `text-box`; nudge the caps down by the same amount instead.
    "not-supports-[text-box:trim-both_cap_alphabetic]:translate-y-[0.115em]",
  ],
};
</script>
