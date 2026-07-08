import { createError, defineEventHandler, readBody } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";
import { RenameWebsiteGalleryImage } from "~~/application/website/rename-website-gallery-image.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { SirvGallerySource } from "~~/infrastructure/sirv/sirv-gallery.source";
import { requireRoles } from "~~/server/utils/rbac";
import { parseRenameGalleryImageBody } from "~~/server/utils/website-gallery";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const config = useRuntimeConfig(event);
  const clientId = config.sirvApiClientId;
  const clientSecret = config.sirvApiClientSecret;
  const cdnDomain = config.sirvCdnDomain;
  const directory = config.sirvDirectory;
  const { websiteConfigRepository } = getRepositories();

  if (!clientId || !clientSecret || !cdnDomain || !directory) {
    throw createError({
      statusCode: 500,
      statusMessage: "Sirv runtime configuration is missing",
    });
  }

  const body = await readBody(event);
  const { path, newName } = parseRenameGalleryImageBody(body);
  const sirvGallerySource = new SirvGallerySource({
    clientId,
    clientSecret,
    cdnDomain,
  });
  const renameWebsiteGalleryImageHandler = new RenameWebsiteGalleryImage(
    sirvGallerySource,
    websiteConfigRepository,
  );
  const image = await renameWebsiteGalleryImageHandler.renameInDirectory(
    directory,
    path,
    newName,
  );

  return {
    image,
  };
});
