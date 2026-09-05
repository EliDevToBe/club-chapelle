import { defineEventHandler } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";
import { GetWebsiteGalleryInfos } from "~~/application/website/get-website-gallery-infos.use-case";
import { SirvGallerySource } from "~~/infrastructure/sirv/sirv-gallery.source";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export default defineEventHandler(async (event) => {
  requireRoles(event, ["admin"]);

  const config = useRuntimeConfig(event);
  const clientId = config.sirvApiClientId;
  const clientSecret = config.sirvApiClientSecret;
  const cdnDomain = config.sirvCdnDomain;

  if (!clientId || !clientSecret || !cdnDomain) {
    throw ApiError(API_ERROR_REASON.website.sirv_not_configured);
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
