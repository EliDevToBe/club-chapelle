import { GetSiteSettings } from "~~/application/website/get-site-settings.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { buildSiteSettingsSeed } from "~~/server/utils/site-settings-seed";

export default defineEventHandler(async (event) => {
  const seed = buildSiteSettingsSeed(event);
  const repos = getRepositories();
  const getSiteSettingsHandler = new GetSiteSettings(
    repos.websiteConfigRepository,
    seed,
  );
  const settings = await getSiteSettingsHandler.get();

  return {
    settings,
  };
});
