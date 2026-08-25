import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import type { WebsiteConfig } from "~~/domain/website/website-config";
import {
  mergeSiteSettingsPatch,
  normaliseSiteSettings,
  type SiteSettings,
  type SiteSettingsSeed,
} from "~~/shared/website/site-settings.schema";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export class PatchSiteSettings {
  constructor(
    private readonly configs: WebsiteConfigRepository,
    private readonly seed: SiteSettingsSeed,
  ) {}

  public patch = async (
    patch: Record<string, unknown>,
  ): Promise<{ config: WebsiteConfig; settings: SiteSettings }> => {
    const stored = await this.configs.findByKey(
      WEBSITE_CONFIG_KEYS.siteSettings,
    );
    const current = normaliseSiteSettings(stored?.settings ?? null, this.seed);
    const settings = mergeSiteSettingsPatch(current, patch);
    const config = await this.configs.upsert(
      WEBSITE_CONFIG_KEYS.siteSettings,
      settings,
    );

    return {
      config,
      settings,
    };
  };
}
