import { PatchOpeningHours } from "~~/application/website/patch-opening-hours.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import {
  mapOpeningHoursPatchError,
  parseOpeningHoursPatchBody,
} from "~~/server/utils/website-config";

type OpeningHoursPatchBody = {
  settings?: unknown;
};

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const body = await readBody<OpeningHoursPatchBody>(event);
  const patch = parseOpeningHoursPatchBody(body);
  const { websiteConfigRepository } = getRepositories();
  const patchOpeningHoursHandler = new PatchOpeningHours(
    websiteConfigRepository,
  );

  try {
    const { config, settings } = await patchOpeningHoursHandler.patch(patch);

    return {
      website_config: toWebsiteConfigDto(config),
      settings,
    };
  } catch (error) {
    return mapOpeningHoursPatchError(error);
  }
});
