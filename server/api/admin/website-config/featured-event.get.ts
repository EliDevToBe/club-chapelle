import { GetFeaturedEvent } from "~~/application/website/get-featured-event.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import { DEFAULT_FEATURED_EVENT } from "~~/shared/website/featured-event.seed";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const { websiteConfigRepository } = getRepositories();
  const getFeaturedEventHandler = new GetFeaturedEvent(
    websiteConfigRepository,
    DEFAULT_FEATURED_EVENT,
  );
  const settings = await getFeaturedEventHandler.get();
  const config = await websiteConfigRepository.findByKey(
    WEBSITE_CONFIG_KEYS.featuredEvent,
  );

  return {
    website_config: config ? toWebsiteConfigDto(config) : null,
    settings,
  };
});
