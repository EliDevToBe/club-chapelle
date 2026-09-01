import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { normaliseTarifs, type Tarifs } from "~~/shared/website/tarifs.schema";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

export class GetTarifs {
  constructor(
    private readonly configs: WebsiteConfigRepository,
    private readonly seed: Tarifs,
  ) {}

  public get = async (): Promise<Tarifs> => {
    const config = await this.configs.findByKey(WEBSITE_CONFIG_KEYS.tarifs);

    return normaliseTarifs(config?.settings ?? null, this.seed);
  };
}
