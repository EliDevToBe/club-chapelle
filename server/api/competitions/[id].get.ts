import { createError } from "h3";
import { FindCompetitionById } from "~~/application/competitions/find-competition-by-id.use-case";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toCompetitionDto } from "~~/server/mappers/competition.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["member", "manager", "admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const repos = createRepositories();
  const findCompetitionById = new FindCompetitionById(
    repos.competitionRepository,
  );
  const competition = await findCompetitionById.findById(id);

  if (!competition) {
    throw createError({
      statusCode: 404,
      statusMessage: "Competition not found",
    });
  }

  return { competition: toCompetitionDto(competition) };
});
