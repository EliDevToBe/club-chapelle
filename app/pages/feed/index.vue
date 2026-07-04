<template>
  <ContentPageWrapper>
    <ChapSection
      is-main-section
      title="Actualités"
      description="Les dernières nouvelles du club"
    >
      <div v-if="pending" class="text-muted text-sm">Chargement…</div>

      <div v-else-if="error" :class="ui.errorWrapper">
        <p class="text-error text-sm">
          Impossible de charger les publications pour le moment.
        </p>
        <ChapButton
          :to="socialFacebook"
          target="_blank"
          variant="outline"
          icon="i-ph-facebook-logo-duotone"
          label="Voir la page Facebook du club"
        />
      </div>

      <template v-else>
        <FeedPostList :posts="posts" />

        <div ref="facebookLinkAnchor" :class="ui.facebookLinkWrapper">
          <ChapButton
            :to="socialFacebook"
            target="_blank"
            variant="soft"
            color="secondary"
            icon="i-ph-facebook-logo-duotone"
            label="Suivre le club sur Facebook"
          />
        </div>
      </template>
    </ChapSection>

    <Transition name="feed-facebook-sticky">
      <div v-if="showStickyFacebookLink" :class="ui.stickyOverlay">
        <div class="bg-neutral-900 rounded-lg">
          <ChapButton
            :to="socialFacebook"
            target="_blank"
            variant="outline"
            color="secondary"
            icon="i-ph-facebook-logo-duotone"
            label="Suivre le club sur Facebook"
            additional-class="shadow-md shadow-default/10"
            class="bg-secondary-800/50"
          />
        </div>
      </div>
    </Transition>
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import FeedPostList from "~/components/feed/FeedPostList.vue";
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ChapButton from "~/components/ui/ChapButton.vue";
import ChapSection from "~/components/ui/ChapSection.vue";

definePageMeta({
  layout: "default",
});

const { public: pub } = useRuntimeConfig();
const socialFacebook = pub.socialFacebook;

const { posts, pending, error } = useFacebookFeed();

const facebookLinkAnchor = ref<HTMLElement | null>(null);
const showStickyFacebookLink = ref(false);

const ui = {
  errorWrapper: "flex flex-col items-start gap-4",
  facebookLinkWrapper: "flex justify-center pt-4",
  stickyOverlay: "fixed inset-x-0 bottom-6 z-40 flex justify-center px-4",
};

const updateStickyVisibility = (isAnchorVisible: boolean): void => {
  showStickyFacebookLink.value = !isAnchorVisible;
};

let intersectionObserver: IntersectionObserver | null = null;

const startStickyObserver = (): void => {
  intersectionObserver?.disconnect();

  const anchor = facebookLinkAnchor.value;

  if (!anchor) {
    showStickyFacebookLink.value = false;
    return;
  }

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];

      if (entry) {
        updateStickyVisibility(entry.isIntersecting);
      }
    },
    {
      threshold: 0,
    },
  );

  intersectionObserver.observe(anchor);
};

watch(
  () => {
    return pending.value || error.value;
  },
  () => {
    if (pending.value || error.value) {
      showStickyFacebookLink.value = false;
      intersectionObserver?.disconnect();
      return;
    }

    nextTick(() => {
      startStickyObserver();
    });
  },
  { immediate: true },
);

onUnmounted(() => {
  intersectionObserver?.disconnect();
});
</script>

<style scoped>
.feed-facebook-sticky-enter-active,
.feed-facebook-sticky-leave-active {
  transition: opacity 0.2s ease;
}

.feed-facebook-sticky-enter-from,
.feed-facebook-sticky-leave-to {
  opacity: 0;
}
</style>
