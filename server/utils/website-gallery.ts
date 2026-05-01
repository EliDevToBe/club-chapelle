import { createError, type MultiPartData } from "h3";
import type { WebsiteGalleryUploadInput } from "~~/application/ports/website-gallery-source.port";

type RenameGalleryImageBody = {
  path?: unknown;
  newName?: unknown;
};

export const parseGalleryUploadParts = (
  parts: MultiPartData[] | undefined,
): WebsiteGalleryUploadInput[] => {
  if (!parts || parts.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No files were provided",
    });
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
    throw createError({
      statusCode: 400,
      statusMessage: "No valid files found in request",
    });
  }

  return files;
};

export const parseRenameGalleryImageBody = (
  body: RenameGalleryImageBody | null | undefined,
): { path: string; newName: string } => {
  const path = typeof body?.path === "string" ? body.path.trim() : "";
  const newName = typeof body?.newName === "string" ? body.newName.trim() : "";

  if (path.length === 0 || newName.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  return { path, newName };
};
