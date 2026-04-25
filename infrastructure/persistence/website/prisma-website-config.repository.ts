import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import type { WebsiteConfig } from "~~/domain/website/website-config";
import type { Prisma, website_config } from "~~/generated/prisma/client";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

const toDomain = (row: website_config): WebsiteConfig => {
  return {
    key: row.key,
    settings: row.settings,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const toInputJsonValue = (value: unknown): Prisma.InputJsonValue => {
  return value as Prisma.InputJsonValue;
};

export class PrismaWebsiteConfigRepository implements WebsiteConfigRepository {
  public findByKey = async (key: string): Promise<WebsiteConfig | null> => {
    const row = await prismaClient.website_config.findUnique({
      where: {
        key,
      },
    });

    if (!row) {
      return null;
    }

    return toDomain(row);
  };

  public upsert = async (
    key: string,
    settings: unknown,
  ): Promise<WebsiteConfig> => {
    const row = await prismaClient.website_config.upsert({
      where: {
        key,
      },
      create: {
        key,
        settings: toInputJsonValue(settings),
      },
      update: {
        settings: toInputJsonValue(settings),
        updated_at: new Date(),
      },
    });

    return toDomain(row);
  };
}
