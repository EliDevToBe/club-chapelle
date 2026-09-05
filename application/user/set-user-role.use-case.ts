import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { User, UserId } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { RoleEnum } from "~~/shared/db-enums";
import {
  ASSIGNABLE_CLUB_ROLES,
  type AssignableClubRole,
} from "~~/shared/user/set-user-role.schema";

export type SetUserRoleResult =
  | { ok: true; user: User }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.user_role.self_change
        | typeof API_ERROR_REASON.common.not_found
        | "developer_target"
        | typeof API_ERROR_REASON.user_role.admin_target
        | typeof API_ERROR_REASON.user_role.last_admin
        | "invalid_role";
    };

const isAssignableClubRole = (role: RoleEnum): role is AssignableClubRole => {
  return (ASSIGNABLE_CLUB_ROLES as readonly RoleEnum[]).includes(role);
};

export class SetUserRole {
  constructor(private readonly users: UserRepository) {}

  public setRole = async (input: {
    targetUserId: UserId;
    actorUserId: UserId;
    actorRoles: readonly RoleEnum[];
    role: RoleEnum;
  }): Promise<SetUserRoleResult> => {
    if (input.targetUserId === input.actorUserId) {
      return { ok: false, reason: API_ERROR_REASON.user_role.self_change };
    }

    if (!isAssignableClubRole(input.role)) {
      return { ok: false, reason: "invalid_role" };
    }

    const target = await this.users.findById(input.targetUserId);
    if (!target) {
      return { ok: false, reason: API_ERROR_REASON.common.not_found };
    }

    if (target.roles.includes("developer")) {
      return { ok: false, reason: "developer_target" };
    }

    const actorIsDeveloper = input.actorRoles.includes("developer");
    const isDemotingAdmin =
      target.roles.includes("admin") && input.role !== "admin";
    if (isDemotingAdmin && !actorIsDeveloper) {
      return { ok: false, reason: API_ERROR_REASON.user_role.admin_target };
    }

    if (isDemotingAdmin) {
      const allUsers = await this.users.findMany();
      const adminCount = allUsers.filter((user) => {
        return user.roles.includes("admin");
      }).length;
      if (adminCount <= 1) {
        return { ok: false, reason: API_ERROR_REASON.user_role.last_admin };
      }
    }

    const updated = await this.users.update(input.targetUserId, {
      roles: [input.role],
    });
    if (!updated) {
      return { ok: false, reason: API_ERROR_REASON.common.not_found };
    }

    return { ok: true, user: updated };
  };
}
