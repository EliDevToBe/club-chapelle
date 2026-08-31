import { GetTarifs } from "~~/application/website/get-tarifs.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import { DEFAULT_TARIFS } from "~~/shared/website/tarifs.seed";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const { websiteConfigRepository } = getRepositories();
  const getTarifsHandler = new GetTarifs(
    websiteConfigRepository,
    DEFAULT_TARIFS,
  );
  const settings = await getTarifsHandler.get();
  const config = await websiteConfigRepository.findByKey(
    WEBSITE_CONFIG_KEYS.tarifs,
  );

  return {
    website_config: config ? toWebsiteConfigDto(config) : null,
    settings,
  };
});
