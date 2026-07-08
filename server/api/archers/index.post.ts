import { CreateArcher } from "~~/application/archer/create-archer.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import {
  toArcherDto,
  toCreateArcherInput,
} from "~~/server/mappers/archer.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { ArcherCreateDto } from "~~/shared/archer/archer.dto";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const body = await readBody<ArcherCreateDto>(event);

  const { archerRepository } = getRepositories();
  const createArcherHandler = new CreateArcher(archerRepository);
  const archer = await createArcherHandler.create(toCreateArcherInput(body));
  return { archer: toArcherDto(archer) };
});
