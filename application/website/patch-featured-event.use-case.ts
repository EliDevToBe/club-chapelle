import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import type { WebsiteConfig } from "~~/domain/website/website-config";
import {
  type FeaturedEvent,
  parseFeaturedEvent,
} from "~~/shared/website/featured-event.schema";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export class PatchFeaturedEvent {
  constructor(private readonly configs: WebsiteConfigRepository) {}

  public patch = async (
    raw: unknown,
  ): Promise<{ config: WebsiteConfig; settings: FeaturedEvent }> => {
    const settings = parseFeaturedEvent(raw);
    const config = await this.configs.upsert(
      WEBSITE_CONFIG_KEYS.featuredEvent,
      settings,
    );

    return {
      config,
      settings,
    };
  };
}
