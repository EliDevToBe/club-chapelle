<template>
  <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
    <a
      :href="post.permalinkUrl"
      target="_blank"
      rel="noopener noreferrer"
      :class="ui.interactive"
      :aria-label="linkAriaLabel"
    >
      <div :class="ui.content">
        <time :datetime="post.createdTime" class="text-sm text-muted">
          {{ formattedDate }}
        </time>

        <p v-if="displayMessage" class="text-default whitespace-pre-line">
          {{ displayMessage }}
        </p>

        <img
          v-if="post.thumbnailUrl"
          :src="post.thumbnailUrl"
          :alt="thumbnailAlt"
          :class="ui.thumbnail"
          loading="lazy"
        />
      </div>

      <div :class="ui.overlay" aria-hidden="true">
        <span :class="ui.overlayLabel">
          <UIcon
            name="i-ph-facebook-logo-duotone"
            class="size-6 shrink-0 text-primary"
          />
          <span>Voir sur Facebook</span>
        </span>
      </div>
    </a>
  </UCard>
</template>

<script setup lang="ts">
import type { FacebookFeedPostDto } from "~~/shared/website/facebook-feed-post.dto";

const props = defineProps<{
  post: FacebookFeedPostDto;
}>();

const ui = {
  interactive: "feed-post-card__interactive relative block",
  content: "feed-post-card__content flex flex-col gap-4 p-4 sm:p-6",
  thumbnail: "w-full rounded-lg object-cover max-h-80",
  overlay:
    "feed-post-card__overlay absolute inset-0 flex items-center justify-center",
  overlayLabel:
    "flex flex-col items-center gap-2 text-center text-sm font-medium text-primary",
};

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
    new Date(props.post.createdTime),
  );
});

const displayMessage = computed(() => {
  const trimmed = props.post.message?.trim();

  if (trimmed) {
    return trimmed;
  }

  return "Publication sans texte";
});

const thumbnailAlt = computed(() => {
  return `Illustration de la publication du ${formattedDate.value}`;
});

const linkAriaLabel = computed(() => {
  return `Voir la publication du ${formattedDate.value} sur Facebook`;
});
</script>

<style scoped>
.feed-post-card__content {
  filter: blur(0);
  transition: filter 1s ease;
  transition-delay: 0s;
}

.feed-post-card__overlay {
  opacity: 0;
  transition: opacity 0.5s ease;
  transition-delay: 0s;
}

.feed-post-card__interactive:hover .feed-post-card__content {
  filter: blur(3px);
  transition-delay: 2s;
}

.feed-post-card__interactive:hover .feed-post-card__overlay {
  opacity: 1;
  transition-delay: 2s;
}
</style>
