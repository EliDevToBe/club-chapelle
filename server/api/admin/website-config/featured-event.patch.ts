import { PatchFeaturedEvent } from "~~/application/website/patch-featured-event.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import {
  mapFeaturedEventPatchError,
  parseFeaturedEventPatchBody,
} from "~~/server/utils/website-config";

type FeaturedEventPatchBody = {
  settings?: unknown;
};

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const body = await readBody<FeaturedEventPatchBody>(event);
  const patch = parseFeaturedEventPatchBody(body);
  const { websiteConfigRepository } = getRepositories();
  const patchFeaturedEventHandler = new PatchFeaturedEvent(
    websiteConfigRepository,
  );

  try {
    const { config, settings } = await patchFeaturedEventHandler.patch(patch);

    return {
      website_config: toWebsiteConfigDto(config),
      settings,
    };
  } catch (error) {
    return mapFeaturedEventPatchError(error);
  }
});
