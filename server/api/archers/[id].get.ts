import { FindArcherById } from "~~/application/archer/find-archer-by-id.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toArcherDto } from "~~/server/mappers/archer.mapper";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["manager", "admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw ApiError(API_ERROR_REASON.common.missing_id);
  }

  const { archerRepository } = getRepositories();
  const findArcherByIdHandler = new FindArcherById(archerRepository);
  const archer = await findArcherByIdHandler.findById(id);

  if (!archer) {
    throw ApiError(API_ERROR_REASON.common.not_found);
  }

  return { archer: toArcherDto(archer) };
});
