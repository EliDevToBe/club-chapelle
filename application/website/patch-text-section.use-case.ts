import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import type { WebsiteConfig } from "~~/domain/website/website-config";
import {
  parseTextSection,
  type TextSection,
} from "~~/shared/website/text-section.schema";
import type { TextSectionKey } from "~~/shared/website/website-config.keys";

export class PatchTextSection {
  constructor(private readonly configs: WebsiteConfigRepository) {}

  public patch = async (
    sectionKey: TextSectionKey,
    raw: unknown,
  ): Promise<{ config: WebsiteConfig; settings: TextSection }> => {
    const settings = parseTextSection(raw);
    const config = await this.configs.upsert(sectionKey, settings);

    return {
      config,
      settings,
    };
  };
}
