import { createError } from "h3";
import { DeleteArcher } from "~~/application/archer/delete-archer.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const { deleteArcherPersistence } = getRepositories();
  const deleteArcherHandler = new DeleteArcher(deleteArcherPersistence);
  const result = await deleteArcherHandler.delete(id);

  if (!result.ok) {
    if (result.reason === "archer_linked") {
      throw createError({
        statusCode: 409,
        statusMessage: "Archer is linked to an account",
      });
    }
    throw createError({ statusCode: 404, statusMessage: "Archer not found" });
  }

  return { deleted: true };
});
