import { GetOpeningHours } from "~~/application/website/get-opening-hours.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import { DEFAULT_OPENING_HOURS } from "~~/shared/website/opening-hours.seed";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const { websiteConfigRepository } = getRepositories();
  const getOpeningHoursHandler = new GetOpeningHours(
    websiteConfigRepository,
    DEFAULT_OPENING_HOURS,
  );
  const settings = await getOpeningHoursHandler.get();
  const config = await websiteConfigRepository.findByKey(
    WEBSITE_CONFIG_KEYS.openingHours,
  );

  return {
    website_config: config ? toWebsiteConfigDto(config) : null,
    settings,
  };
});
