import { FindWebsiteConfig } from "~~/application/website/find-website-config.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toHomepageCarouselSettings } from "~~/server/mappers/website-config.mapper";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export default defineEventHandler(async () => {
  const repos = getRepositories();
  const findWebsiteConfigHandler = new FindWebsiteConfig(
    repos.websiteConfigRepository,
  );
  const config = await findWebsiteConfigHandler.findByKey(
    WEBSITE_CONFIG_KEYS.homepageCarousel,
  );

  return {
    settings: toHomepageCarouselSettings(config?.settings ?? null),
  };
});
