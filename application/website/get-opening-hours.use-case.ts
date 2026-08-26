import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import {
  normaliseOpeningHours,
  type OpeningHours,
} from "~~/shared/website/opening-hours.schema";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export class GetOpeningHours {
  constructor(
    private readonly configs: WebsiteConfigRepository,
    private readonly seed: OpeningHours,
  ) {}

  public get = async (): Promise<OpeningHours> => {
    const config = await this.configs.findByKey(
      WEBSITE_CONFIG_KEYS.openingHours,
    );

    return normaliseOpeningHours(config?.settings ?? null, this.seed);
  };
}
