import { ListPublicCompetitions } from "~~/application/competitions/list-public-competitions.use-case";
import type { Competition } from "~~/domain/competitions/competition";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
import type { CompetitionDto } from "~~/shared/competitions/competition.dto";
import { formatDateForDb } from "~~/shared/utils";

const toDto = (comp: Competition): CompetitionDto => ({
  id: comp.id,
  file_id: comp.fileId,
  name: comp.name,
  start_date: formatDateForDb(comp.startDate),
  end_date: formatDateForDb(comp.endDate),
  place: comp.place,
  price: comp.price,
  category: comp.category,
  type: comp.type,
  is_championship: comp.isChampionship,
  season_year: comp.seasonYear,
  created_at: formatDateForDb(comp.createdAt),
});

export default defineEventHandler(async () => {
  const repos = createRepositories();
  const listPublicCompetitions = new ListPublicCompetitions(
    repos.competitionRepository,
  );
  const rows = await listPublicCompetitions.findPublic();
  return { competitions: rows.map(toDto) };
});
