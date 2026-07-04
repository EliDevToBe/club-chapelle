import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListArchers } from "~~/application/archer/list-archers.use-case";
import type { ArcherRepository } from "~~/application/ports/archer-repository.port";
import type { Archer } from "~~/domain/archer/archer";

const sampleArcher = (overrides: Partial<Archer> = {}): Archer => ({
  id: "a1",
  publicName: "Alice Martin",
  authUserId: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  offboardedAt: null,
  ...overrides,
});

describe("ListArchers", () => {
  let repo: ArcherRepository;

  beforeEach(() => {
    repo = {
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      findPage: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("delegates findMany to the archer repository", async () => {
    const rows = [sampleArcher()];
    repo.findMany = vi.fn().mockResolvedValue(rows);
    const useCase = new ListArchers(repo);

    await expect(useCase.findMany()).resolves.toEqual(rows);
    expect(repo.findMany).toHaveBeenCalledTimes(1);
  });

  it("delegates findPage to the archer repository with includeOffboarded defaulting to false", async () => {
    const page = { items: [sampleArcher()], total: 1 };
    repo.findPage = vi.fn().mockResolvedValue(page);
    const useCase = new ListArchers(repo);

    await expect(
      useCase.findPage({ limit: 20, offset: 0, search: "ali" }),
    ).resolves.toEqual(page);

    expect(repo.findPage).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      search: "ali",
      includeOffboarded: false,
    });
  });

  it("forwards includeOffboarded when explicitly set to true", async () => {
    const page = { items: [sampleArcher()], total: 1 };
    repo.findPage = vi.fn().mockResolvedValue(page);
    const useCase = new ListArchers(repo);

    await useCase.findPage({
      limit: 10,
      offset: 20,
      includeOffboarded: true,
    });

    expect(repo.findPage).toHaveBeenCalledWith({
      limit: 10,
      offset: 20,
      includeOffboarded: true,
    });
  });
});
