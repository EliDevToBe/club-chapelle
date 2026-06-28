import type {
  CompetitionBrowseDateFilter,
  CompetitionRepository,
} from "~~/application/ports/competition-repository.port";
import type {
  ParticipationRepository,
  ParticipationWithArcherSummary,
} from "~~/application/ports/participation-repository.port";
import type { Competition } from "~~/domain/competitions/competition";

export type CompetitionWithParticipations = {
  competition: Competition;
  participations: ParticipationWithArcherSummary[];
};

export type ListCompetitionsWithParticipationsFilters = {
  dateFilter: CompetitionBrowseDateFilter;
  q: string | null;
  onlyMine: boolean;
  viewerUserId: string;
  viewerName: string | null;
};

const competitionMatchesSearch = (
  competition: Competition,
  participations: ParticipationWithArcherSummary[],
  needle: string,
  viewerId: string,
  viewerName: string | null,
): boolean => {
  if (competition.name.toLowerCase().includes(needle)) {
    return true;
  }

  for (const p of participations) {
    if (p.archerPublicName.toLowerCase().includes(needle)) {
      return true;
    }
    if (
      p.archerAuthUserId === viewerId &&
      viewerName !== null &&
      viewerName !== "" &&
      viewerName.toLowerCase().includes(needle)
    ) {
      return true;
    }
  }
  return false;
};

const competitionHasMineParticipation = (
  participations: ParticipationWithArcherSummary[],
  viewerUserId: string,
): boolean => {
  return participations.some((p) => {
    return p.archerAuthUserId === viewerUserId;
  });
};

export class ListCompetitionsWithParticipations {
  constructor(
    private readonly competitions: CompetitionRepository,
    private readonly participations: ParticipationRepository,
  ) {}

  public list = async (
    filters: ListCompetitionsWithParticipationsFilters,
  ): Promise<CompetitionWithParticipations[]> => {
    const competitionRows = await this.competitions.findManyForListing(
      filters.dateFilter,
    );

    const ids = competitionRows.map((c) => {
      return c.id;
    });

    const participationRows =
      await this.participations.findManyWithArcherSummary(ids);

    const byCompetition = new Map<string, ParticipationWithArcherSummary[]>();

    for (const p of participationRows) {
      const list = byCompetition.get(p.competitionId) ?? [];
      list.push(p);
      byCompetition.set(p.competitionId, list);
    }

    let competitionsWithParticipationsRows = competitionRows.map(
      (competition) => {
        return {
          competition,
          participations: byCompetition.get(competition.id) ?? [],
        };
      },
    );

    if (filters.onlyMine) {
      competitionsWithParticipationsRows =
        competitionsWithParticipationsRows.filter((comp) => {
          return competitionHasMineParticipation(
            comp.participations,
            filters.viewerUserId,
          );
        });
    }

    if (filters.q !== null && filters.q !== "") {
      const needle = filters.q.toLowerCase();

      competitionsWithParticipationsRows =
        competitionsWithParticipationsRows.filter((row) => {
          return competitionMatchesSearch(
            row.competition,
            row.participations,
            needle,
            filters.viewerUserId,
            filters.viewerName,
          );
        });
    }

    return competitionsWithParticipationsRows;
  };
}
