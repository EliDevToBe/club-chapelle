import { createError, defineEventHandler, readBody } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";
import { DeleteWebsiteGalleryImages } from "~~/application/website/delete-website-gallery-images.use-case";
import { RemoveGalleryImagesFromHomepageCarousel } from "~~/application/website/remove-gallery-images-from-homepage-carousel.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { SirvGallerySource } from "~~/infrastructure/sirv/sirv-gallery.source";
import { requireRoles } from "~~/server/utils/rbac";
import { parseDeleteGalleryImagesBody } from "~~/server/utils/website-gallery";

type DeleteGalleryImagesBody = {
  paths?: unknown;
};

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

  const body = await readBody<DeleteGalleryImagesBody>(event);
  const { paths } = parseDeleteGalleryImagesBody(body);
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
    paths,
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

  const repos = getRepositories();
  const removeGalleryImagesFromHomepageCarouselHandler =
    new RemoveGalleryImagesFromHomepageCarousel(repos.websiteConfigRepository);
  const { carouselConfigUpdated, removedFromCarouselCount } =
    await removeGalleryImagesFromHomepageCarouselHandler.removeByPaths([
      ...deletedPaths,
    ]);

  return {
    results,
    carouselConfigUpdated,
    removedFromCarouselCount,
  };
});
