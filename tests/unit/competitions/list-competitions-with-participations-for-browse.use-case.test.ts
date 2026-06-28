import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListCompetitionsWithParticipations } from "~~/application/competitions/list-competitions-with-participations-for-browse.use-case";
import type { CompetitionRepository } from "~~/application/ports/competition-repository.port";
import type {
  ParticipationRepository,
  ParticipationWithArcherSummary,
} from "~~/application/ports/participation-repository.port";
import type { Competition } from "~~/domain/competitions/competition";

const sampleCompetition = (id: string, name: string): Competition => ({
  id,
  fileId: null,
  name,
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

const sampleParticipation = (
  overrides: Partial<ParticipationWithArcherSummary> &
    Pick<ParticipationWithArcherSummary, "id" | "competitionId" | "archerId">,
): ParticipationWithArcherSummary => ({
  registrationStatus: "registered",
  paymentStatus: "paid",
  payer: "archer",
  distance: "m18",
  target: "trispot",
  weapon: "recurve",
  createdAt: new Date("2026-02-01T00:00:00.000Z"),
  archerPublicName: "Archer One",
  archerAuthUserId: null,
  ...overrides,
});

const baseInput = () => ({
  dateFilter: {
    startDateYmd: null as string | null,
    endDateYmd: null as string | null,
  },
  q: null as string | null,
  onlyMine: false,
  viewerUserId: "user-1",
  viewerName: null as string | null,
});

describe("ListCompetitionsWithParticipationsForBrowse", () => {
  let competitions: CompetitionRepository;
  let participations: ParticipationRepository;

  beforeEach(() => {
    competitions = {
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      findManyForListing: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    participations = {
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      findManyWithArcherSummary: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("loads participations only for browse competition ids", async () => {
    const c1 = sampleCompetition("c1", "First");
    const c2 = sampleCompetition("c2", "Second");
    competitions.findManyForListing = vi.fn().mockResolvedValue([c1, c2]);

    const p1 = sampleParticipation({
      id: "p1",
      competitionId: "c1",
      archerId: "a1",
    });
    const p2 = sampleParticipation({
      id: "p2",
      competitionId: "c2",
      archerId: "a2",
      archerPublicName: "Other",
    });
    participations.findManyWithArcherSummary = vi
      .fn()
      .mockImplementation(async (ids: readonly string[] | undefined) => {
        expect(ids).toEqual(["c1", "c2"]);
        return [p1, p2];
      });

    const handler = new ListCompetitionsWithParticipations(
      competitions,
      participations,
    );
    const rows = await handler.list(baseInput());

    expect(rows).toEqual([
      { competition: c1, participations: [p1] },
      { competition: c2, participations: [p2] },
    ]);
    expect(competitions.findManyForListing).toHaveBeenCalledWith({
      startDateYmd: null,
      endDateYmd: null,
    });
  });

  it("returns empty participations when a competition has no rows", async () => {
    const c1 = sampleCompetition("c1", "Only");
    competitions.findManyForListing = vi.fn().mockResolvedValue([c1]);
    participations.findManyWithArcherSummary = vi.fn().mockResolvedValue([]);

    const handler = new ListCompetitionsWithParticipations(
      competitions,
      participations,
    );
    const rows = await handler.list(baseInput());

    expect(rows).toEqual([{ competition: c1, participations: [] }]);
  });

  it("filters by onlyMine", async () => {
    const c1 = sampleCompetition("c1", "A");
    const c2 = sampleCompetition("c2", "B");
    competitions.findManyForListing = vi.fn().mockResolvedValue([c1, c2]);
    const pMine = sampleParticipation({
      id: "p1",
      competitionId: "c1",
      archerId: "a1",
      archerAuthUserId: "user-1",
    });
    participations.findManyWithArcherSummary = vi
      .fn()
      .mockResolvedValue([pMine]);

    const handler = new ListCompetitionsWithParticipations(
      competitions,
      participations,
    );
    const rows = await handler.list({
      ...baseInput(),
      onlyMine: true,
    });

    expect(rows).toEqual([{ competition: c1, participations: [pMine] }]);
  });

  it("filters by search q on competition name", async () => {
    const c1 = sampleCompetition("c1", "Paris Open");
    competitions.findManyForListing = vi.fn().mockResolvedValue([c1]);
    participations.findManyWithArcherSummary = vi.fn().mockResolvedValue([]);

    const handler = new ListCompetitionsWithParticipations(
      competitions,
      participations,
    );
    const rows = await handler.list({
      ...baseInput(),
      q: "paris",
    });
    expect(rows).toHaveLength(1);

    const rowsEmpty = await handler.list({
      ...baseInput(),
      q: "lyon",
    });
    expect(rowsEmpty).toHaveLength(0);
  });
});
