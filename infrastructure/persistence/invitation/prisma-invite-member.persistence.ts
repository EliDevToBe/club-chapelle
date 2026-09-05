import type {
  BindInvitedMemberToArcherInput,
  BindInvitedMemberToArcherResult,
  CreateInvitedMemberInput,
  CreateInvitedMemberResult,
  InviteMemberPersistence,
} from "~~/application/ports/invite-member-persistence.port";
import { sortRolesByOrder } from "~~/domain/user/role";
import type { User } from "~~/domain/user/user";
import type { auth_user, auth_user_role } from "~~/generated/prisma/client";
import { Prisma } from "~~/generated/prisma/client";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

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

// Matches Prisma P2002 messages such as "Unique constraint failed on the fields: (`email`)"
const uniqueConstraintMessagePattern =
  /Unique constraint failed on the fields: \(([^)]+)\)/;

const isUniqueConstraintOn = (error: unknown, field: string): boolean => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }
  if (error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  if (Array.isArray(target) && target.includes(field)) {
    return true;
  }

  const match = error.message.match(uniqueConstraintMessagePattern);
  if (!match?.[1]) {
    return false;
  }

  return match[1]
    .split(",")
    .map((value) => {
      return value.trim().replace(/^`|`$/g, "");
    })
    .includes(field);
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
      if (isUniqueConstraintOn(error, "email")) {
        return {
          ok: false,
          reason: API_ERROR_REASON.invitation.email_already_linked,
        };
      }
      if (isUniqueConstraintOn(error, "public_name")) {
        return {
          ok: false,
          reason: API_ERROR_REASON.invitation.public_name_taken,
        };
      }
      throw error;
    }
  };

  public bindInvitedMemberToArcher = async (
    input: BindInvitedMemberToArcherInput,
  ): Promise<BindInvitedMemberToArcherResult> => {
    try {
      return await prismaClient.$transaction(async (tx) => {
        const archer = await tx.archer.findUnique({
          where: { id: input.archerId },
        });
        if (!archer) {
          return { ok: false, reason: API_ERROR_REASON.common.not_found };
        }
        if (archer.auth_user_id) {
          return {
            ok: false,
            reason: API_ERROR_REASON.invitation.archer_already_linked,
          };
        }

        const existingUser = await tx.auth_user.findFirst({
          where: {
            email: { equals: input.email, mode: "insensitive" },
          },
          include: {
            roles: true,
            archers: { select: { id: true } },
          },
        });

        if (existingUser) {
          if (existingUser.authenticated) {
            return {
              ok: false,
              reason: API_ERROR_REASON.invitation.account_already_active,
            };
          }

          const linkedElsewhere = existingUser.archers.some(
            (linkedArcher) => linkedArcher.id !== input.archerId,
          );
          if (linkedElsewhere) {
            return {
              ok: false,
              reason: API_ERROR_REASON.invitation.email_already_linked,
            };
          }

          await tx.archer.update({
            where: { id: input.archerId },
            data: { auth_user_id: existingUser.id, offboarded_at: null },
          });

          const updated = await tx.auth_user.update({
            where: { id: existingUser.id },
            data: {
              name: input.name,
              authenticated: false,
              password: null,
            },
            include: { roles: true },
          });

          return { ok: true, user: toDomain(updated), resent: true };
        }

        const created = await tx.auth_user.create({
          data: {
            email: input.email,
            name: input.name,
            authenticated: false,
            password: null,
            roles: {
              create: { role: "member" },
            },
          },
          include: { roles: true },
        });

        await tx.archer.update({
          where: { id: input.archerId },
          data: { auth_user_id: created.id, offboarded_at: null },
        });

        return { ok: true, user: toDomain(created), resent: false };
      });
    } catch (error) {
      if (isUniqueConstraintOn(error, "email")) {
        return {
          ok: false,
          reason: API_ERROR_REASON.invitation.email_already_linked,
        };
      }
      throw error;
    }
  };
}
