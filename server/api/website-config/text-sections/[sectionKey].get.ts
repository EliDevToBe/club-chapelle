import { GetTextSection } from "~~/application/website/get-text-section.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { requireTextSectionKey } from "~~/server/utils/website-config";

export default defineEventHandler(async (event) => {
  const sectionKey = requireTextSectionKey(event);
  const { websiteConfigRepository } = getRepositories();
  const getTextSectionHandler = new GetTextSection(websiteConfigRepository);
  const settings = await getTextSectionHandler.get(sectionKey);

  return {
    settings,
  };
});
