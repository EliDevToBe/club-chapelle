import { ListPublicCompetitions } from "~~/application/competitions/list-public-competitions.use-case";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
import type { PublicCompetitionDto } from "~~/shared/competitions/public-competition.dto";

const toDto = (c: {
  id: string;
  title: string;
  startsAt: Date;
}): PublicCompetitionDto => ({
  id: c.id,
  title: c.title,
  startsAt: c.startsAt.toISOString(),
});

export default defineEventHandler(async () => {
  const repos = createRepositories();
  const rows = await new ListPublicCompetitions(
    repos.competitionRepository,
  ).findPublic();
  return { competitions: rows.map(toDto) };
});
