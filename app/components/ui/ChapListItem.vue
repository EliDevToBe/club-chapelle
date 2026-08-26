<template>
  <li>
    <span :class="ui.listWrapper">
      <span v-if="$slots.leading" :class="ui.leading">
        <slot name="leading" />
      </span>
      <UIcon :name="ui.listIcon.icon" :class="ui.listIcon.class" />
      <span :class="ui.content">
        <slot />
      </span>
      <span v-if="$slots.trailing" :class="ui.trailing">
        <slot name="trailing" />
      </span>
    </span>
  </li>
</template>

<script setup lang="ts">
const ui = {
  listWrapper: "flex items-start md:items-center gap-2",
  leading: "shrink-0",
  content: "min-w-0 flex-1",
  trailing: "shrink-0 flex items-center gap-1",
  listIcon: {
    icon: "i-ph-arrow-right-bold",
    class: "mt-1 shrink-0 text-primary-500",
  },
};
</script>
