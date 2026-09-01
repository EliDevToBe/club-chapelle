import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import type { WebsiteConfig } from "~~/domain/website/website-config";
import { parseTarifs, type Tarifs } from "~~/shared/website/tarifs.schema";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export class PatchTarifs {
  constructor(private readonly configs: WebsiteConfigRepository) {}

  public patch = async (
    raw: unknown,
  ): Promise<{ config: WebsiteConfig; settings: Tarifs }> => {
    const settings = parseTarifs(raw);
    const config = await this.configs.upsert(
      WEBSITE_CONFIG_KEYS.tarifs,
      settings,
    );

    return {
      config,
      settings,
    };
  };
}
