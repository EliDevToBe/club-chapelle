import type { MultiPartData } from "h3";
import type { WebsiteGalleryUploadInput } from "~~/application/ports/website-gallery-source.port";
import type { DeleteGalleryImagesBody } from "~~/application/website/delete-website-gallery-images.use-case";
import { ApiError } from "~~/server/utils/api-error";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { asTrimmedString } from "~~/shared/utils/base-string.helper";

type RenameGalleryImageBody = {
  path?: unknown;
  newName?: unknown;
};

export const parseGalleryUploadParts = (
  parts: MultiPartData[] | undefined,
): WebsiteGalleryUploadInput[] => {
  if (!parts || parts.length === 0) {
    throw ApiError(API_ERROR_REASON.website.no_files_provided);
  }

  const files: WebsiteGalleryUploadInput[] = [];

  for (const part of parts) {
    if (part.name === "files") {
      files.push({
        filename: part.filename ?? "image",
        data: part.data,
        contentType: part.type,
      });
    }
  }

  if (files.length === 0) {
    throw ApiError(API_ERROR_REASON.website.no_valid_files);
  }

  return files;
};

export const parseRenameGalleryImageBody = (
  body: RenameGalleryImageBody | null | undefined,
): { path: string; newName: string } => {
  const path = asTrimmedString(body?.path);
  const newName = asTrimmedString(body?.newName);

  if (path.length === 0 || newName.length === 0) {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  return { path, newName };
};

export const parseDeleteGalleryImagesBody = (
  body: DeleteGalleryImagesBody | null | undefined,
): { filenames: string[] } => {
  const rawFilenames = Array.isArray(body?.filenames) ? body.filenames : null;

  if (!rawFilenames) {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  const filenames = [...new Set(rawFilenames)]
    .map((entry) => {
      return asTrimmedString(entry);
    })
    .filter((entry) => {
      return entry.length > 0;
    });

  if (filenames.length === 0) {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  return { filenames };
};
