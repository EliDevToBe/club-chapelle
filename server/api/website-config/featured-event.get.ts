import { defineEventHandler } from "h3";
import { GetFeaturedEvent } from "~~/application/website/get-featured-event.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toPublicFeaturedEvent } from "~~/shared/website/featured-event.schema";
import { DEFAULT_FEATURED_EVENT } from "~~/shared/website/featured-event.seed";

export default defineEventHandler(async () => {
  const { websiteConfigRepository } = getRepositories();
  const getFeaturedEventHandler = new GetFeaturedEvent(
    websiteConfigRepository,
    DEFAULT_FEATURED_EVENT,
  );
  const settings = await getFeaturedEventHandler.get();

  return {
    settings: toPublicFeaturedEvent(settings),
  };
});
