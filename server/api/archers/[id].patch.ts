import { UpdateArcher } from "~~/application/archer/update-archer.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import {
  toArcherDto,
  toUpdateArcherInput,
} from "~~/server/mappers/archer.mapper";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { ArcherUpdateDto } from "~~/shared/archer/archer.dto";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw ApiError(API_ERROR_REASON.common.missing_id);
  }

  const body = await readBody<ArcherUpdateDto>(event);
  const { archerRepository } = getRepositories();
  const updateArcherHandler = new UpdateArcher(archerRepository);
  const archer = await updateArcherHandler.update(
    id,
    toUpdateArcherInput(body),
  );

  if (!archer) {
    throw ApiError(API_ERROR_REASON.common.not_found);
  }

  return { archer: toArcherDto(archer) };
});
