import {
  type FileInfo,
  type FolderContents,
  SirvApiError,
  SirvClient,
  type StorageInfo,
} from "@sirv/rest-api-js";
import type {
  WebsiteGallerySource,
  WebsiteGalleryUploadInput,
} from "~~/application/ports/website-gallery-source.port";
import type {
  WebsiteGalleryDeleteItemResultDto,
  WebsiteGalleryImageDto,
  WebsiteGalleryInfos,
  WebsiteGalleryUploadItemResultDto,
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
  const withoutUnderscores = withoutExtension.replace(/_/g, " ");

  // Convert the first letter of the string to uppercase.
  return withoutUnderscores.replace(/^\w/, (character) =>
    character.toUpperCase(),
  );
};

const normaliseDirectory = (directory: string): string => {
  const trimmed = directory.trim().replace(/\/+$/, "");
  if (trimmed.length === 0) {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

/**
 * Normalise a filename by removing leading slashes and replacing internal slashes with underscores.
 * @param filename - The filename to normalise.
 * @returns The normalised filename.
 */
const normaliseFilename = (filename: string): string => {
  return (
    filename
      .trim()
      .replace(/^\/+/, "")
      // Slaches
      .replace(/\/+/g, "_")
  );
};

const toSafeBaseName = (value: string): string => {
  return (
    value
      .trim()
      // Replace the extension
      .replace(/\.[^.]+$/, "")
      // Replace spaces with hyphens
      .replace(/\s+/g, "_")
      // Replace non-alphanumeric characters with hyphens
      .replace(/[^a-zA-Z0-9-_]/g, "")
      // Replace multiple hyphens with a single hyphen
      .replace(/-+/g, "-")
      // Replace multiple underscores with a single underscore
      .replace(/_+/g, "_")
      // Replace leading and trailing hyphens and underscores
      .replace(/^[-_]+|[-_]+$/g, "")
  );
};

const splitFilename = (
  filename: string,
): {
  baseName: string;
  extension: string;
} => {
  const trimmed = filename.trim();
  const lastDot = trimmed.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === trimmed.length - 1) {
    return {
      baseName: trimmed,
      extension: "",
    };
  }

  return {
    baseName: trimmed.slice(0, lastDot),
    extension: trimmed.slice(lastDot + 1).toLowerCase(),
  };
};

export class SirvGallerySource implements WebsiteGallerySource {
  private readonly sirvClient: SirvClient;
  private connectPromise: Promise<void> | null = null;
  private readonly cdnDomain: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseApiUrl = "https://api.sirv.com/v2";

  constructor(config: {
    clientId: string;
    clientSecret: string;
    cdnDomain: string;
  }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;

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

    const dtoEntries = entries
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

    return dtoEntries;
  };

  public getStorageInfo = async (): Promise<WebsiteGalleryInfos> => {
    await this.ensureConnected();
    const infos = (await this.sirvClient.getStorageInfo()) as StorageInfo & {
      plan: number;
    };

    return {
      allowance: infos.plan,
      used: infos.used,
      files: infos.files,
      burstable: infos.burstable,
    };
  };

  public uploadImages = async (
    directory: string,
    files: WebsiteGalleryUploadInput[],
  ): Promise<WebsiteGalleryUploadItemResultDto[]> => {
    await this.ensureConnected();
    const safeDirectory = normaliseDirectory(directory);
    const results: WebsiteGalleryUploadItemResultDto[] = [];

    for (const file of files) {
      const safeName = normaliseFilename(file.filename);
      if (safeName.length === 0) {
        results.push({
          filename: file.filename,
          success: false,
          image: null,
          error: "Invalid filename",
        });
        continue;
      }

      const targetPath = `${safeDirectory}/${safeName}`.replace(/\/+/g, "/");

      try {
        const token = await this.getToken();

        const binary = Buffer.isBuffer(file.data)
          ? file.data
          : Buffer.from(file.data);

        const apiUrl = new URL(`${this.baseApiUrl}/files/upload`);
        apiUrl.searchParams.set("filename", targetPath);

        const uploadResponse = await fetch(apiUrl.toString(), {
          method: "POST",
          // @ts-expect-error Buffer is not assignable to BodyInit
          body: binary,
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": file.contentType || "application/octet-stream",
            "content-length": String(binary.byteLength),
          },
        });
        if (!uploadResponse.ok) {
          throw new Error(
            `Sirv upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
          );
        }
        const image = await this.readImageByPath(targetPath, safeDirectory);
        results.push({
          filename: file.filename,
          success: true,
          image,
        });
      } catch (error) {
        if (error instanceof SirvApiError) {
          console.error("API Error:", error.message);
          console.error("Status:", error.statusCode);
          console.error("Code:", error.errorCode);
        }
        console.error("[SirvGallerySource] Upload failed:", error);

        results.push({
          filename: file.filename,
          success: false,
          image: null,
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }

    return results;
  };

  public renameImage = async (
    directory: string,
    fromPath: string,
    newName: string,
  ): Promise<WebsiteGalleryImageDto> => {
    await this.ensureConnected();
    const safeDirectory = normaliseDirectory(directory);
    const sourcePath = fromPath.startsWith("/")
      ? fromPath
      : `${safeDirectory}/${fromPath}`;
    const sourceFileName = sourcePath.split("/").at(-1) ?? "";
    const sourceSplit = splitFilename(sourceFileName);
    const requestedName = newName.trim().toLowerCase();
    const requestedSplit = splitFilename(requestedName);
    const baseName = toSafeBaseName(requestedSplit.baseName);

    if (baseName.length === 0) {
      throw new Error("Invalid target filename");
    }

    const finalExtension = requestedSplit.extension || sourceSplit.extension;
    const targetFileName = finalExtension
      ? `${baseName}.${finalExtension}`
      : baseName;
    const targetPath = `${safeDirectory}/${targetFileName}`.replace(
      /\/+/g,
      "/",
    );

    const isNameAlreadyTaken = await this.checkIfExists(targetPath);
    if (isNameAlreadyTaken) {
      throw new Error("Image name already exists");
    }

    const token = await this.getToken();
    const apiUrl = new URL(`${this.baseApiUrl}/files/rename`);
    apiUrl.searchParams.set("from", sourcePath);
    apiUrl.searchParams.set("to", targetPath);

    const renameResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!renameResponse.ok) {
      throw new Error(
        `Sirv rename failed: ${renameResponse.status} ${renameResponse.statusText}`,
      );
    }

    return this.readImageByPath(targetPath, safeDirectory);
  };

  public deleteImages = async (
    directory: string,
    paths: string[],
  ): Promise<WebsiteGalleryDeleteItemResultDto[]> => {
    await this.ensureConnected();
    const safeDirectory = normaliseDirectory(directory);
    const token = await this.getToken();
    const results: WebsiteGalleryDeleteItemResultDto[] = [];

    for (const path of paths) {
      const trimmedPath = path.trim();
      if (trimmedPath.length === 0) {
        results.push({
          path,
          success: false,
          error: "Invalid image path",
        });
        continue;
      }

      const targetPath = trimmedPath.startsWith("/")
        ? trimmedPath
        : `${safeDirectory}/${trimmedPath}`.replace(/\/+/g, "/");
      const apiUrl = new URL(`${this.baseApiUrl}/files/delete`);
      apiUrl.searchParams.set("filename", targetPath);

      try {
        const deleteResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!deleteResponse.ok) {
          throw new Error(
            `Sirv delete failed: ${deleteResponse.status} ${deleteResponse.statusText}`,
          );
        }

        results.push({
          path: targetPath,
          success: true,
        });
      } catch (error) {
        if (error instanceof SirvApiError) {
          console.error("API Error:", error.message);
          console.error("Status:", error.statusCode);
          console.error("Code:", error.errorCode);
        }
        console.error("[SirvGallerySource] Delete failed:", error);

        results.push({
          path: targetPath,
          success: false,
          error: error instanceof Error ? error.message : "Delete failed",
        });
      }
    }

    return results;
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
      console.warn("[Sirv toImageDto] No path found for entry", entry);
      return null;
    }

    const normalisedPath = path.startsWith("/") ? path : `${directory}/${path}`;
    if (!isImagePath(normalisedPath)) {
      console.warn("[Sirv toImageDto] Not an image", normalisedPath);
      return null;
    }

    const url = this.buildCdnUrl(normalisedPath);
    const previewUrl = this.buildCdnUrl(normalisedPath, {
      w: 240,
      h: 160,
      q: 85,
    });

    const mimetype =
      entryRecord.contentType && typeof entryRecord.contentType === "string"
        ? entryRecord.contentType
        : `image/${path.split(".").at(-1)?.toLowerCase()}`;

    return {
      path: normalisedPath,
      label: toReadableLabel(normalisedPath),
      url,
      preview_url: previewUrl,
      width: asNumber(entryRecord.width) ?? 240,
      height: asNumber(entryRecord.height) ?? 160,
      mtime: asString(entryRecord.mtime),
      mimetype,
      size: asNumber(entryRecord.size) ?? 0,
    };
  };

  private readImageByPath = async (
    path: string,
    directory: string,
  ): Promise<WebsiteGalleryImageDto> => {
    const info = await this.sirvClient.getFileInfo(path);

    if (!info.filename) {
      info.filename = path.split("/").at(-1) ?? "";

      if (info.filename.length === 0) {
        console.error("[Sirv readImageByPath] Invalid filename", path);
        throw new Error("Invalid filename");
      }
    }

    const dto = this.toImageDto(info, directory);
    if (!dto) {
      throw new Error("Uploaded file is not a valid image");
    }

    return dto;
  };

  private getToken = async (): Promise<string> => {
    const response = await fetch(`${this.baseApiUrl}/token`, {
      method: "POST",
      body: JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Failed to get token: ${response.status} ${response.statusText}`,
      );
    }
    const data = await response.json();
    const token: string = data.token;
    return token;
  };

  private checkIfExists = async (path: string): Promise<boolean> => {
    try {
      await this.sirvClient.getFileInfo(path);
      return true;
    } catch (error) {
      if (error instanceof SirvApiError && error.statusCode === 404) {
        return false;
      }

      throw error;
    }
  };
}
