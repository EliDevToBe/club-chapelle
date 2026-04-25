import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { FindWebsiteConfig } from "~~/application/website/find-website-config.use-case";
import { UpdateWebsiteConfig } from "~~/application/website/update-website-config.use-case";

describe("Website config use cases", () => {
  let repo: WebsiteConfigRepository;

  beforeEach(() => {
    repo = {
      findByKey: vi.fn(),
      upsert: vi.fn(),
    };
  });

  it("finds a config by key", async () => {
    const expectedConfig = {
      key: "homepage_carousel",
      settings: { data: [] },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    repo.findByKey = vi.fn().mockResolvedValue(expectedConfig);

    const findWebsiteConfig = new FindWebsiteConfig(repo);
    await expect(
      findWebsiteConfig.findByKey("homepage_carousel"),
    ).resolves.toEqual(expectedConfig);
    expect(repo.findByKey).toHaveBeenCalledWith("homepage_carousel");
  });

  it("upserts a config payload", async () => {
    const updatedConfig = {
      key: "homepage_carousel",
      settings: {
        data: [
          {
            label: "A",
            url: "https://archers-chapelle.sirv.com/chapelle/a.jpg",
          },
        ],
      },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-02-01T00:00:00.000Z"),
    };
    repo.upsert = vi.fn().mockResolvedValue(updatedConfig);

    const updateWebsiteConfig = new UpdateWebsiteConfig(repo);
    const settings = updatedConfig.settings;
    await expect(
      updateWebsiteConfig.update("homepage_carousel", settings),
    ).resolves.toEqual(updatedConfig);
    expect(repo.upsert).toHaveBeenCalledWith("homepage_carousel", settings);
  });
});
