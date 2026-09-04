import { createError } from "h3";
import { RevokeMemberAccess } from "~~/application/user/revoke-member-access.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  const authUser = requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "User id is required",
    });
  }

  const { revokeMemberAccessPersistence } = getRepositories();
  const revokeMemberAccessHandler = new RevokeMemberAccess(
    revokeMemberAccessPersistence,
  );
  const result = await revokeMemberAccessHandler.revoke({
    targetUserId: id,
    actorUserId: authUser.id,
  });

  if (!result.ok) {
    if (result.reason === "self_revoke") {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot revoke your own access",
      });
    }
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  return { ok: true };
});
