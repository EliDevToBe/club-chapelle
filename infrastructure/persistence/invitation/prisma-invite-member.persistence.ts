import type {
  CreateInvitedMemberInput,
  CreateInvitedMemberResult,
  InviteMemberPersistence,
} from "~~/application/ports/invite-member-persistence.port";
import { sortRolesByOrder } from "~~/domain/user/role";
import type { User } from "~~/domain/user/user";
import {
  type auth_user,
  type auth_user_role,
  Prisma,
} from "~~/generated/prisma/client";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

type AuthUserWithRoles = auth_user & { roles: auth_user_role[] };

const toDomain = (row: AuthUserWithRoles): User => {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    roles: sortRolesByOrder(row.roles.map((roleRow) => roleRow.role)),
    authenticated: row.authenticated,
    createdAt: row.created_at,
  };
};

const uniqueTargetIncludes = (error: unknown, field: string): boolean => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }
  if (error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.includes(field);
  }
  if (typeof target === "string") {
    return target.includes(field);
  }

  return false;
};

export class PrismaInviteMemberPersistence implements InviteMemberPersistence {
  public createInvitedMember = async (
    input: CreateInvitedMemberInput,
  ): Promise<CreateInvitedMemberResult> => {
    try {
      const row = await prismaClient.$transaction(async (tx) => {
        return tx.auth_user.create({
          data: {
            email: input.email,
            name: input.name,
            authenticated: false,
            password: null,
            roles: {
              create: { role: "member" },
            },
            archers: {
              create: { public_name: input.name },
            },
          },
          include: { roles: true },
        });
      });

      return { ok: true, user: toDomain(row) };
    } catch (error) {
      if (uniqueTargetIncludes(error, "email")) {
        return { ok: false, reason: "email_taken" };
      }
      if (uniqueTargetIncludes(error, "public_name")) {
        return { ok: false, reason: "public_name_taken" };
      }
      throw error;
    }
  };
}
