import { ListWebsiteGalleryImages } from "~~/application/website/list-website-gallery-images.use-case";
import { SirvGallerySource } from "~~/infrastructure/sirv/sirv-gallery.source";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const config = useRuntimeConfig(event);
  const clientId = config.sirvApiClientId;
  const clientSecret = config.sirvApiClientSecret;
  const cdnDomain = config.sirvCdnDomain;
  const directory = config.sirvDirectory;

  if (!clientId || !clientSecret || !cdnDomain) {
    throw createError({
      statusCode: 500,
      statusMessage: "Sirv runtime configuration is missing",
    });
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
