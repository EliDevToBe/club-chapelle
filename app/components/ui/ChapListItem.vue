<template>
  <li>
    <span :class="ui.listWrapper">
      <UIcon :name="ui.listIcon.icon" :class="ui.listIcon.class" />
      <span>
        <slot />
      </span>
    </span>
  </li>
</template>

<script setup lang="ts">
const ui = {
  listWrapper: "flex items-start md:items-center gap-2",
  listIcon: {
    icon: "i-ph-arrow-right-bold",
    class: "mt-1 shrink-0 text-primary-500",
  },
};
</script>

<style scoped lang=""></style>
