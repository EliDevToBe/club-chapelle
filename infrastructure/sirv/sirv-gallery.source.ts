import {
  type FileInfo,
  type FolderContents,
  SirvClient,
  type StorageInfo,
} from "@sirv/rest-api-js";
import type { WebsiteGallerySource } from "~~/application/ports/website-gallery-source.port";
import type {
  WebsiteGalleryImageDto,
  WebsiteGalleryInfos,
} from "~~/shared/website/website-config.dto";

const normaliseDomain = (cdnDomain: string): string => {
  return cdnDomain
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
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

const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif", "avif"] as const;

const isImagePath = (path: string): boolean => {
  const extension = path.split(".").at(-1)?.toLowerCase() ?? "";
  return imageExtensions.includes(
    extension as (typeof imageExtensions)[number],
  );
};

const toReadableLabel = (path: string): string => {
  const rawFileName = path.split("/").at(-1) ?? path;
  const withoutExtension = rawFileName.replace(/\.[^.]+$/, "");

  const withSpaces = withoutExtension.replace(/[-_]+/g, " ").trim();
  if (withSpaces.length === 0) {
    return withoutExtension;
  }

  return withSpaces.replace(/\b\w/g, (character) => character.toUpperCase());
};

export class SirvGallerySource implements WebsiteGallerySource {
  private readonly sirvClient: SirvClient;
  private connectPromise: Promise<void> | null = null;
  private readonly cdnDomain: string;

  constructor(config: {
    clientId: string;
    clientSecret: string;
    cdnDomain: string;
  }) {
    this.cdnDomain = normaliseDomain(config.cdnDomain);
    this.sirvClient = new SirvClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });
  }

  /**
   * List images in a directory, sorted by label and mtime (modification time).
   * @param directory - The directory to list images from.
   * @returns A promise that resolves to an array of WebsiteGalleryImageDto.
   */
  public listImagesInDirectory = async (
    directory: string,
  ): Promise<WebsiteGalleryImageDto[]> => {
    await this.ensureConnected();
    const payload = await this.sirvClient.readFolderContents(directory);
    const entries = this.extractEntries(payload);

    return entries
      .map((entry) => this.toImageDto(entry, directory))
      .filter((entry): entry is WebsiteGalleryImageDto => {
        return entry !== null;
      })
      .sort((left, right) => {
        return (
          (left.label.localeCompare(right.label, "fr") &&
            right?.mtime?.localeCompare(left?.mtime ?? "", "fr")) ??
          0
        );
      });
  };

  public getStorageInfo = async (): Promise<WebsiteGalleryInfos> => {
    await this.ensureConnected();
    const infos = (await this.sirvClient.getStorageInfo()) as StorageInfo & {
      plan: number;
    };

    console.log(infos);

    return {
      allowance: infos.plan,
      used: infos.used,
      files: infos.files,
      burstable: infos.burstable,
    };
  };

  private ensureConnected = async (): Promise<void> => {
    if (this.sirvClient.isConnected()) {
      return;
    }

    if (!this.connectPromise) {
      this.connectPromise = this.sirvClient.connect().then(() => {
        return undefined;
      });
    }

    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  };

  private extractEntries = (payload: FolderContents): FileInfo[] => {
    if (Array.isArray(payload.contents)) {
      return payload.contents;
    }

    return [];
  };

  private buildCdnUrl = (
    path: string,
    params?: Record<string, string | number>,
  ): string => {
    const normalisedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`https://${this.cdnDomain}${normalisedPath}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  };

  private toImageDto = (
    entry: FileInfo,
    directory: string,
  ): WebsiteGalleryImageDto | null => {
    const entryRecord = entry as unknown as Record<string, unknown>;
    const path = asString(entry.filename) ?? asString(entry.basename) ?? null;

    if (!path) {
      return null;
    }

    const normalisedPath = path.startsWith("/") ? path : `${directory}/${path}`;
    if (!isImagePath(normalisedPath)) {
      return null;
    }

    const url = this.buildCdnUrl(normalisedPath);
    const previewUrl = this.buildCdnUrl(normalisedPath, {
      w: 240,
      h: 160,
      format: "webp",
      q: 85,
    });

    return {
      path: normalisedPath,
      label: toReadableLabel(normalisedPath),
      url,
      preview_url: previewUrl,
      width: asNumber(entryRecord.width) ?? 240,
      height: asNumber(entryRecord.height) ?? 160,
      mtime: asString(entryRecord.mtime),
    };
  };
}
