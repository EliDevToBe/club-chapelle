import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import type { WebsiteConfig } from "~~/domain/website/website-config";

export class UpdateWebsiteConfig {
  constructor(private readonly configs: WebsiteConfigRepository) {}

  public update = async (
    key: string,
    settings: unknown,
  ): Promise<WebsiteConfig> => {
    return this.configs.upsert(key, settings);
  };
}
