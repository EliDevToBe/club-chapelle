import { UpdateWebsiteConfig } from "~~/application/website/update-website-config.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import { buildSiteSettingsSeed } from "~~/server/utils/site-settings-seed";
import { parseSiteSettingsPatchBody } from "~~/server/utils/website-config";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

type SiteSettingsPatchBody = {
  settings?: unknown;
};

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const seed = buildSiteSettingsSeed(event);
  const body = await readBody<SiteSettingsPatchBody>(event);
  const normalisedSettings = parseSiteSettingsPatchBody(body, seed);
  const { websiteConfigRepository } = getRepositories();
  const updateWebsiteConfigHandler = new UpdateWebsiteConfig(
    websiteConfigRepository,
  );
  const config = await updateWebsiteConfigHandler.update(
    WEBSITE_CONFIG_KEYS.siteSettings,
    normalisedSettings,
  );

  return {
    website_config: toWebsiteConfigDto(config),
    settings: normalisedSettings,
  };
});
