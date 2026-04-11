import { describe, expect, it, vi } from "vitest";
import { ListPublicCompetitions } from "~~/application/competitions/list-public-competitions.use-case";
import type { CompetitionRepository } from "~~/application/ports/competition-repository.port";

describe("ListPublicCompetitions", () => {
  it("delegates to the competition repository", async () => {
    const rows = [
      {
        id: "c1",
        title: "Indoor",
        startsAt: new Date("2026-06-01T10:00:00.000Z"),
      },
    ];
    const repo: CompetitionRepository = {
      findPublic: vi.fn().mockResolvedValue(rows),
    };
    const useCase = new ListPublicCompetitions(repo);
    await expect(useCase.findPublic()).resolves.toEqual(rows);
    expect(repo.findPublic).toHaveBeenCalledTimes(1);
  });
});
