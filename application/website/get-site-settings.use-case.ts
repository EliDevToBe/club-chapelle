import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import {
  normaliseSiteSettings,
  type SiteSettings,
  type SiteSettingsSeed,
} from "~~/shared/website/site-settings.schema";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export class GetSiteSettings {
  constructor(
    private readonly configs: WebsiteConfigRepository,
    private readonly seed: SiteSettingsSeed,
  ) {}

  public get = async (): Promise<SiteSettings> => {
    const config = await this.configs.findByKey(
      WEBSITE_CONFIG_KEYS.siteSettings,
    );

    return normaliseSiteSettings(config?.settings ?? null, this.seed);
  };
}
