import { createError } from "h3";
import { UpdateArcher } from "~~/application/archer/update-archer.use-case";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
import {
  toArcherDto,
  toUpdateArcherInput,
} from "~~/server/mappers/archer.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { ArcherUpdateDto } from "~~/shared/archer/archer.dto";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const body = await readBody<ArcherUpdateDto>(event);
  const repos = createRepositories();
  const updateArcherHandler = new UpdateArcher(repos.archerRepository);
  const archer = await updateArcherHandler.update(
    id,
    toUpdateArcherInput(body),
  );

  if (!archer) {
    throw createError({ statusCode: 404, statusMessage: "Archer not found" });
  }

  return { archer: toArcherDto(archer) };
});
