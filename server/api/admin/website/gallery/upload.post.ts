import { createError, defineEventHandler, readMultipartFormData } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";
import { UploadWebsiteGalleryImages } from "~~/application/website/upload-website-gallery-images.use-case";
import { SirvGallerySource } from "~~/infrastructure/sirv/sirv-gallery.source";
import { requireRoles } from "~~/server/utils/rbac";
import { parseGalleryUploadParts } from "~~/server/utils/website-gallery";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const config = useRuntimeConfig(event);
  const clientId = config.sirvApiClientId;
  const clientSecret = config.sirvApiClientSecret;
  const cdnDomain = config.sirvCdnDomain;
  const directory = config.sirvDirectory;

  if (!clientId || !clientSecret || !cdnDomain || !directory) {
    throw createError({
      statusCode: 500,
      statusMessage: "Sirv runtime configuration is missing",
    });
  }

  const parts = await readMultipartFormData(event);

  if (!parts) {
    throw createError({
      statusCode: 400,
      statusMessage: "No files were provided",
    });
  }

  const files = parseGalleryUploadParts(parts);
  const sirvGallerySource = new SirvGallerySource({
    clientId,
    clientSecret,
    cdnDomain,
  });
  const uploadWebsiteGalleryImagesHandler = new UploadWebsiteGalleryImages(
    sirvGallerySource,
  );
  const results = await uploadWebsiteGalleryImagesHandler.uploadInDirectory(
    directory,
    files,
  );

  return {
    results,
  };
});
