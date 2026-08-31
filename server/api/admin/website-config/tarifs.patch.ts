import { PatchTarifs } from "~~/application/website/patch-tarifs.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import {
  mapTarifsPatchError,
  parseTarifsPatchBody,
} from "~~/server/utils/website-config";

type TarifsPatchBody = {
  settings?: unknown;
};

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const body = await readBody<TarifsPatchBody>(event);
  const patch = parseTarifsPatchBody(body);
  const { websiteConfigRepository } = getRepositories();
  const patchTarifsHandler = new PatchTarifs(websiteConfigRepository);

  try {
    const { config, settings } = await patchTarifsHandler.patch(patch);

    return {
      website_config: toWebsiteConfigDto(config),
      settings,
    };
  } catch (error) {
    return mapTarifsPatchError(error);
  }
});
