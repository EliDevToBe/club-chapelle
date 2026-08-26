import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import type { WebsiteConfig } from "~~/domain/website/website-config";
import {
  type OpeningHours,
  parseOpeningHours,
} from "~~/shared/website/opening-hours.schema";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export class PatchOpeningHours {
  constructor(private readonly configs: WebsiteConfigRepository) {}

  public patch = async (
    raw: unknown,
  ): Promise<{ config: WebsiteConfig; settings: OpeningHours }> => {
    const settings = parseOpeningHours(raw);
    const config = await this.configs.upsert(
      WEBSITE_CONFIG_KEYS.openingHours,
      settings,
    );

    return {
      config,
      settings,
    };
  };
}
