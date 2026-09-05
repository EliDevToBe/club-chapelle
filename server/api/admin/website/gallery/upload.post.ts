import { defineEventHandler, readMultipartFormData } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";
import { UploadWebsiteGalleryImages } from "~~/application/website/upload-website-gallery-images.use-case";
import { SirvGallerySource } from "~~/infrastructure/sirv/sirv-gallery.source";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { parseGalleryUploadParts } from "~~/server/utils/website-gallery";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const config = useRuntimeConfig(event);
  const clientId = config.sirvApiClientId;
  const clientSecret = config.sirvApiClientSecret;
  const cdnDomain = config.sirvCdnDomain;
  const directory = config.sirvDirectory;

  if (!clientId || !clientSecret || !cdnDomain || !directory) {
    throw ApiError(API_ERROR_REASON.website.sirv_not_configured);
  }

  const parts = await readMultipartFormData(event);

  if (!parts) {
    throw ApiError(API_ERROR_REASON.website.no_files_provided);
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
