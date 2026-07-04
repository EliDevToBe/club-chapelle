<template>
  <div :class="ui.root">
    <p v-if="posts.length === 0" class="text-sm text-muted">
      Aucune publication à afficher pour le moment.
    </p>

    <FeedPostCard v-for="post in visiblePosts" :key="post.id" :post="post" />

    <div v-if="showLoadMore" :class="ui.loadMoreWrapper">
      <UButton
        variant="link"
        color="primary"
        label="Voir plus d’actualités"
        @click="loadMore"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FeedPostCard from "~/components/feed/FeedPostCard.vue";
import type { FacebookFeedPostDto } from "~~/shared/website/facebook-feed-post.dto";
import {
  FEED_PAGE_SIZE,
  getNextVisibleCount,
} from "~~/shared/website/feed-pagination";

const props = defineProps<{
  posts: FacebookFeedPostDto[];
}>();

const ui = {
  root: "flex flex-col gap-6",
  loadMoreWrapper: "flex justify-center pt-2",
};

const visibleCount = ref(FEED_PAGE_SIZE);

const visiblePosts = computed(() => {
  return props.posts.slice(0, visibleCount.value);
});

const showLoadMore = computed(() => {
  return visibleCount.value < props.posts.length;
});

const loadMore = (): void => {
  visibleCount.value = getNextVisibleCount(
    visibleCount.value,
    props.posts.length,
  );
};

watch(
  () => {
    return props.posts.length;
  },
  () => {
    visibleCount.value = FEED_PAGE_SIZE;
  },
);
</script>
