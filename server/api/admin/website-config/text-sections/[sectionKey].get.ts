import { GetTextSection } from "~~/application/website/get-text-section.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import { requireTextSectionKey } from "~~/server/utils/website-config";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const sectionKey = requireTextSectionKey(event);
  const { websiteConfigRepository } = getRepositories();
  const getTextSectionHandler = new GetTextSection(websiteConfigRepository);
  const settings = await getTextSectionHandler.get(sectionKey);
  const config = await websiteConfigRepository.findByKey(sectionKey);

  return {
    website_config: config ? toWebsiteConfigDto(config) : null,
    settings,
  };
});
