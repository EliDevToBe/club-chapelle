import { UpdateWebsiteConfig } from "~~/application/website/update-website-config.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { parseHomepageCarouselPatchBody } from "~~/server/utils/website-config";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

type HomepageCarouselPatchBody = {
  settings?: unknown;
};

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const body = await readBody<HomepageCarouselPatchBody>(event);
  const normalisedSettings = parseHomepageCarouselPatchBody(body);
  const repos = getRepositories();
  const updateWebsiteConfigHandler = new UpdateWebsiteConfig(
    repos.websiteConfigRepository,
  );
  const config = await updateWebsiteConfigHandler.update(
    WEBSITE_CONFIG_KEYS.homepageCarousel,
    normalisedSettings,
  );

  return {
    website_config: toWebsiteConfigDto(config),
    settings: normalisedSettings,
  };
});
