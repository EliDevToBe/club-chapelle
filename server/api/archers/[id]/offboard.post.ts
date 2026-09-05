import { createError } from "h3";
import { OffboardArcherShell } from "~~/application/archer/offboard-archer-shell.use-case";
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

  const { offboardArcherShellPersistence } = getRepositories();
  const offboardArcherShellHandler = new OffboardArcherShell(
    offboardArcherShellPersistence,
  );
  const result = await offboardArcherShellHandler.offboard(id);

  if (!result.ok) {
    if (result.reason === "archer_linked") {
      throw createError({
        statusCode: 409,
        statusMessage: "Archer is linked to an account",
      });
    }
    if (result.reason === "already_offboarded") {
      throw createError({
        statusCode: 409,
        statusMessage: "Archer is already archived",
      });
    }
    throw createError({ statusCode: 404, statusMessage: "Archer not found" });
  }

  return { offboarded: true };
});
