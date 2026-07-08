import { GetSiteSettings } from "~~/application/website/get-site-settings.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import { buildSiteSettingsSeed } from "~~/server/utils/site-settings-seed";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const seed = buildSiteSettingsSeed(event);
  const repos = getRepositories();
  const getSiteSettingsHandler = new GetSiteSettings(
    repos.websiteConfigRepository,
    seed,
  );
  const settings = await getSiteSettingsHandler.get();
  const config = await repos.websiteConfigRepository.findByKey(
    WEBSITE_CONFIG_KEYS.siteSettings,
  );

  return {
    website_config: config ? toWebsiteConfigDto(config) : null,
    settings,
  };
});
