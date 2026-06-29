import { UpdateWebsiteConfig } from "~~/application/website/update-website-config.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { parseFeatureFlagsPatchBody } from "~~/server/utils/website-config";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

type FeatureFlagsPatchBody = {
  settings?: unknown;
};

export default defineEventHandler(async (event) => {
  requireDeveloper(event);

  const body = await readBody<FeatureFlagsPatchBody>(event);
  const normalisedSettings = parseFeatureFlagsPatchBody(body);
  const repos = getRepositories();
  const updateWebsiteConfigHandler = new UpdateWebsiteConfig(
    repos.websiteConfigRepository,
  );
  const config = await updateWebsiteConfigHandler.update(
    WEBSITE_CONFIG_KEYS.featureFlags,
    normalisedSettings,
  );

  return {
    website_config: toWebsiteConfigDto(config),
    settings: normalisedSettings,
  };
});
