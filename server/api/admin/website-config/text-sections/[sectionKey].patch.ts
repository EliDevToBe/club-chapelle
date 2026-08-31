import { PatchTextSection } from "~~/application/website/patch-text-section.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toWebsiteConfigDto } from "~~/server/mappers/website-config.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import {
  mapTextSectionPatchError,
  parseTextSectionPatchBody,
  requireTextSectionKey,
} from "~~/server/utils/website-config";

type TextSectionPatchBody = {
  settings?: unknown;
};

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const sectionKey = requireTextSectionKey(event);
  const body = await readBody<TextSectionPatchBody>(event);
  const patch = parseTextSectionPatchBody(body);
  const { websiteConfigRepository } = getRepositories();
  const patchTextSectionHandler = new PatchTextSection(websiteConfigRepository);

  try {
    const { config, settings } = await patchTextSectionHandler.patch(
      sectionKey,
      patch,
    );

    return {
      website_config: toWebsiteConfigDto(config),
      settings,
    };
  } catch (error) {
    return mapTextSectionPatchError(error);
  }
});
