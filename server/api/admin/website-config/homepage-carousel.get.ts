import { FindWebsiteConfig } from "~~/application/website/find-website-config.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import {
  toHomepageCarouselSettings,
  toWebsiteConfigDto,
} from "~~/server/mappers/website-config.mapper";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const { websiteConfigRepository } = getRepositories();
  const findWebsiteConfigHandler = new FindWebsiteConfig(
    websiteConfigRepository,
  );
  const config = await findWebsiteConfigHandler.findByKey(
    WEBSITE_CONFIG_KEYS.homepageCarousel,
  );

  if (!config) {
    return {
      website_config: null,
      settings: toHomepageCarouselSettings(null),
    };
  }

  return {
    website_config: toWebsiteConfigDto(config),
    settings: toHomepageCarouselSettings(config.settings),
  };
});
