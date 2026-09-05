import { ListWebsiteGalleryImages } from "~~/application/website/list-website-gallery-images.use-case";
import { SirvGallerySource } from "~~/infrastructure/sirv/sirv-gallery.source";
import { ApiError } from "~~/server/utils/api-error";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const config = useRuntimeConfig(event);
  const clientId = config.sirvApiClientId;
  const clientSecret = config.sirvApiClientSecret;
  const cdnDomain = config.sirvCdnDomain;
  const directory = config.sirvDirectory;

  if (!clientId || !clientSecret || !cdnDomain) {
    throw ApiError(API_ERROR_REASON.website.sirv_not_configured);
  }

  const sirvGallerySource = new SirvGallerySource({
    clientId,
    clientSecret,
    cdnDomain,
  });
  const listWebsiteGalleryImagesHandler = new ListWebsiteGalleryImages(
    sirvGallerySource,
  );
  const images =
    await listWebsiteGalleryImagesHandler.listInDirectory(directory);

  return { images };
});
