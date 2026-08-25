import { PatchSiteSettings } from "~~/application/website/patch-site-settings.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import { buildSiteSettingsSeed } from "~~/server/utils/site-settings-seed";
import {
  mapSiteSettingsPatchError,
  parseSiteSettingsPatchBody,
} from "~~/server/utils/website-config";

type SiteSettingsPatchBody = {
  settings?: unknown;
};

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const seed = buildSiteSettingsSeed(event);
  const body = await readBody<SiteSettingsPatchBody>(event);
  const patch = parseSiteSettingsPatchBody(body);
  const { websiteConfigRepository } = getRepositories();
  const patchSiteSettingsHandler = new PatchSiteSettings(
    websiteConfigRepository,
    seed,
  );

  try {
    const { config, settings } = await patchSiteSettingsHandler.patch(patch);

    return {
      website_config: toWebsiteConfigDto(config),
      settings,
    };
  } catch (error) {
    return mapSiteSettingsPatchError(error);
  }
});
