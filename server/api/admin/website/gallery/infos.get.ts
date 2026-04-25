import { GetWebsiteGalleryInfos } from "~~/application/website/get-website-gallery-infos.use-case";
import { SirvGallerySource } from "~~/infrastructure/sirv/sirv-gallery.source";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const config = useRuntimeConfig(event);
  const clientId = config.sirvApiClientId;
  const clientSecret = config.sirvApiClientSecret;
  const cdnDomain = config.sirvCdnDomain;

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
  const getWebsiteGalleryInfosHandler = new GetWebsiteGalleryInfos(
    sirvGallerySource,
  );
  const infos = await getWebsiteGalleryInfosHandler.getInfos();

  return infos;
});
