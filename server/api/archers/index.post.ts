import { CreateArcher } from "~~/application/archer/create-archer.use-case";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
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

  const repos = createRepositories();
  const createArcher = new CreateArcher(repos.archerRepository);
  const archer = await createArcher.create(toCreateArcherInput(body));
  return { archer: toArcherDto(archer) };
});
