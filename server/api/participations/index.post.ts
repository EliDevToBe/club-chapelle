import { CreateParticipation } from "~~/application/participations/create-participation.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import {
  toCreateParticipationInput,
  toParticipationDto,
} from "~~/server/mappers/participation.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";
import type { ParticipationCreateDto } from "~~/shared/participation/participation.dto";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const body = await readBody<ParticipationCreateDto>(event);

  const repos = getRepositories();
  const createParticipationHandler = new CreateParticipation(
    repos.participationRepository,
  );
  const participation = await createParticipationHandler.create(
    toCreateParticipationInput(body),
  );
  return { participation: toParticipationDto(participation) };
});
