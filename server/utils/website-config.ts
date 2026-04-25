import { createError } from "h3";
import { toHomepageCarouselSettings } from "~~/server/mappers/website-config.mapper";

type HomepageCarouselPatchBody = {
  settings?: unknown;
};

export const parseHomepageCarouselPatchBody = (
  body: HomepageCarouselPatchBody | null | undefined,
) => {
  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  return toHomepageCarouselSettings(body.settings);
};
