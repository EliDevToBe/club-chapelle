import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import {
  type FeaturedEvent,
  normaliseFeaturedEvent,
} from "~~/shared/website/featured-event.schema";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export class GetFeaturedEvent {
  constructor(
    private readonly configs: WebsiteConfigRepository,
    private readonly seed: FeaturedEvent,
  ) {}

  public get = async (): Promise<FeaturedEvent> => {
    const config = await this.configs.findByKey(
      WEBSITE_CONFIG_KEYS.featuredEvent,
    );

    return normaliseFeaturedEvent(config?.settings ?? null, this.seed);
  };
}
