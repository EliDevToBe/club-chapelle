import type { WebsiteConfig } from "~~/domain/website/website-config";

export interface WebsiteConfigRepository {
  findByKey: (key: string) => Promise<WebsiteConfig | null>;
  upsert: (key: string, settings: unknown) => Promise<WebsiteConfig>;
}
