import { defineEventHandler, readBody } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";
import {
  type DeleteGalleryImagesBody,
  DeleteWebsiteGalleryImages,
} from "~~/application/website/delete-website-gallery-images.use-case";
import { RemoveGalleryImagesFromHomepageCarousel } from "~~/application/website/remove-gallery-images-from-homepage-carousel.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { SirvGallerySource } from "~~/infrastructure/sirv/sirv-gallery.source";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { parseDeleteGalleryImagesBody } from "~~/server/utils/website-gallery";
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

  const body = await readBody<DeleteGalleryImagesBody>(event);
  const { filenames } = parseDeleteGalleryImagesBody(body);
  const sirvGallerySource = new SirvGallerySource({
    clientId,
    clientSecret,
    cdnDomain,
  });
  const deleteWebsiteGalleryImagesHandler = new DeleteWebsiteGalleryImages(
    sirvGallerySource,
  );
  const results = await deleteWebsiteGalleryImagesHandler.deleteInDirectory(
    directory,
    filenames,
  );

  const deletedPaths = new Set(
    results
      .filter((result) => {
        return result.success;
      })
      .map((result) => {
        return result.path;
      }),
  );

  const { websiteConfigRepository } = getRepositories();
  const removeGalleryImagesFromHomepageCarouselHandler =
    new RemoveGalleryImagesFromHomepageCarousel(websiteConfigRepository);

  await removeGalleryImagesFromHomepageCarouselHandler.removeByPaths([
    ...deletedPaths,
  ]);

  return {
    results,
    deletedCount: deletedPaths.size,
  };
});
