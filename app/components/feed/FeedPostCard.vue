<template>
  <UCard>
    <template #header>
      <time :datetime="post.createdTime" class="text-sm text-muted">
        {{ formattedDate }}
      </time>
    </template>

    <div :class="ui.content">
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

    <template #footer>
      <ChapButton
        :to="post.permalinkUrl"
        target="_blank"
        variant="soft"
        size="sm"
        icon="i-ph-eye"
        label="Voir sur Facebook"
      />
    </template>
  </UCard>
</template>

<script setup lang="ts">
import ChapButton from "~/components/ui/ChapButton.vue";
import type { FacebookFeedPostDto } from "~~/shared/website/facebook-feed-post.dto";

const props = defineProps<{
  post: FacebookFeedPostDto;
}>();

const ui = {
  content: "flex flex-col gap-4",
  thumbnail: "w-full rounded-lg object-cover max-h-80",
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
</script>
