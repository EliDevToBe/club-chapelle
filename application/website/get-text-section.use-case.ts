import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import {
  normaliseTextSection,
  type TextSection,
} from "~~/shared/website/text-section.schema";
import { getTextSectionSeed } from "~~/shared/website/text-section.seed";
import type { TextSectionKey } from "~~/shared/website/website-config.keys";

export class GetTextSection {
  constructor(private readonly configs: WebsiteConfigRepository) {}

  public get = async (sectionKey: TextSectionKey): Promise<TextSection> => {
    const config = await this.configs.findByKey(sectionKey);

    return normaliseTextSection(
      config?.settings ?? null,
      getTextSectionSeed(sectionKey),
    );
  };
}
