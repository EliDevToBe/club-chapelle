import { describe, expect, it, vi } from "vitest";
import { ListPublicCompetitions } from "~~/application/competitions/list-public-competitions.use-case";
import type { CompetitionRepository } from "~~/application/ports/competition-repository.port";
import type { Competition } from "~~/domain/competitions/competition";

const sampleCompetition = (): Competition => ({
  id: "c1",
  fileId: null,
  name: "Indoor",
  startDate: new Date("2026-06-01T00:00:00.000Z"),
  endDate: new Date("2026-06-02T00:00:00.000Z"),
  place: "Hall A",
  price: "25.00",
  category: "indoor",
  type: "olympic",
  isChampionship: false,
  seasonYear: 2026,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
});

describe("ListPublicCompetitions", () => {
  it("delegates to the competition repository", async () => {
    const rows = [sampleCompetition()];
    const repo: CompetitionRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn().mockResolvedValue(rows),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const useCase = new ListPublicCompetitions(repo);
    await expect(useCase.findPublic()).resolves.toEqual(rows);
    expect(repo.findMany).toHaveBeenCalledTimes(1);
  });
});
