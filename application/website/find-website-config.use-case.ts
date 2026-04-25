import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import type { WebsiteConfig } from "~~/domain/website/website-config";

export class FindWebsiteConfig {
  constructor(private readonly configs: WebsiteConfigRepository) {}

  public findByKey = async (key: string): Promise<WebsiteConfig | null> => {
    return this.configs.findByKey(key);
  };
}
