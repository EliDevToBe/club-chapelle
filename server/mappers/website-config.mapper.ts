import type { WebsiteConfig } from "~~/domain/website/website-config";
import type {
  HomepageCarouselItemDto,
  HomepageCarouselSettingsDto,
  WebsiteConfigDto,
} from "~~/shared/website/website-config.dto";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const asString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return trimmed;
};

const asNumber = (value: unknown): number | null => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return value;
};

export const toWebsiteConfigDto = (config: WebsiteConfig): WebsiteConfigDto => {
  return {
    key: config.key,
    settings: config.settings,
    created_at: config.createdAt.toISOString(),
    updated_at: config.updatedAt.toISOString(),
  };
};

export const toHomepageCarouselSettings = (
  settings: unknown,
): HomepageCarouselSettingsDto => {
  if (!isRecord(settings) || !Array.isArray(settings.data)) {
    return { data: [] };
  }

  const data: HomepageCarouselItemDto[] = settings.data
    .map((entry: unknown): HomepageCarouselItemDto | null => {
      if (!isRecord(entry)) {
        return null;
      }

      const label = asString(entry.label);
      const url = asString(entry.url);
      const previewUrl = asString(entry.preview_url);
      const width = asNumber(entry.width);
      const height = asNumber(entry.height);
      const mtime = asString(entry.mtime);
      const mimetype = asString(entry.mimetype);

      if (
        !label ||
        !url ||
        !previewUrl ||
        width === null ||
        height === null ||
        !mimetype
      ) {
        return null;
      }

      return {
        label,
        url,
        preview_url: previewUrl,
        width,
        height,
        mtime,
        mimetype,
      };
    })
    .filter((entry): entry is HomepageCarouselItemDto => {
      return entry !== null;
    });

  return { data };
};
