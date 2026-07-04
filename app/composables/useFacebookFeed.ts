import { mockFacebookFeedPosts } from "~~/shared/website/facebook-feed.mock";
import type { FacebookFeedPostDto } from "~~/shared/website/facebook-feed-post.dto";

export const useFacebookFeed = () => {
  const posts = ref<FacebookFeedPostDto[]>([]);
  const pending = ref(false);
  const error = ref<Error | null>(null);

  const loadPosts = (): void => {
    pending.value = true;
    error.value = null;

    try {
      posts.value = mockFacebookFeedPosts();
    } catch (loadError) {
      error.value =
        loadError instanceof Error
          ? loadError
          : new Error("Impossible de charger les actualités.");
      posts.value = [];
    } finally {
      pending.value = false;
    }
  };

  loadPosts();

  return {
    posts,
    pending,
    error,
    loadPosts,
  };
};
