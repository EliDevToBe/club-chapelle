import type {
  CreateUserInput,
  UpdateUserInput,
  UserAuthCredentials,
  UserPasswordResetLookup,
  UserRepository,
} from "~~/application/ports/user-repository.port";
import { sortRolesByOrder } from "~~/domain/user/role";
import type { User } from "~~/domain/user/user";
import type {
  auth_user,
  auth_user_role,
  Prisma,
} from "~~/generated/prisma/client";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

type AuthUserWithRoles = auth_user & { roles: auth_user_role[] };

const toDomain = (row: AuthUserWithRoles): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  roles: sortRolesByOrder(row.roles.map((r) => r.role)),
  authenticated: row.authenticated,
  createdAt: row.created_at,
});

const toCredentials = (row: AuthUserWithRoles): UserAuthCredentials => ({
  id: row.id,
  email: row.email,
  name: row.name,
  roles: sortRolesByOrder(row.roles.map((r) => r.role)),
  authenticated: row.authenticated,
  passwordHash: row.password,
});

const toPasswordResetLookup = (
  row: AuthUserWithRoles,
): UserPasswordResetLookup => ({
  id: row.id,
  email: row.email,
  name: row.name,
  authenticated: row.authenticated,
  passwordHash: row.password,
});

const rolesInclude = { roles: true } as const;

export class PrismaUserRepository implements UserRepository {
  public create = async (input: CreateUserInput): Promise<User> => {
    if (input.roles.length === 0) {
      throw new Error("CreateUserInput.roles must contain at least one role");
    }

    const row = await prismaClient.auth_user.create({
      data: {
        email: input.email,
        name: input.name ?? undefined,
        authenticated: input.authenticated,
        password: input.password,
        roles: {
          createMany: {
            data: input.roles.map((role) => ({ role })),
          },
        },
      },
      include: rolesInclude,
    });

    return toDomain(row);
  };

  public findById = async (id: string): Promise<User | null> => {
    const row = await prismaClient.auth_user.findUnique({
      where: { id },
      include: rolesInclude,
    });
    return row ? toDomain(row) : null;
  };

  public findByEmailWithPasswordHash = async (
    email: string,
  ): Promise<UserAuthCredentials | null> => {
    const row = await prismaClient.auth_user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
      include: rolesInclude,
    });
    if (!row) {
      return null;
    }
    return toCredentials(row);
  };

  public findByEmailForPasswordReset = async (
    email: string,
  ): Promise<UserPasswordResetLookup | null> => {
    const row = await prismaClient.auth_user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
      include: rolesInclude,
    });
    if (!row) {
      return null;
    }
    return toPasswordResetLookup(row);
  };

  public findForPasswordResetById = async (
    id: string,
  ): Promise<UserPasswordResetLookup | null> => {
    const row = await prismaClient.auth_user.findUnique({
      where: { id },
      include: rolesInclude,
    });
    if (!row) {
      return null;
    }
    return toPasswordResetLookup(row);
  };

  public findMany = async (): Promise<User[]> => {
    const rows = await prismaClient.auth_user.findMany({
      orderBy: { created_at: "desc" },
      include: rolesInclude,
    });
    return rows.map(toDomain);
  };

  public update = async (
    id: string,
    input: UpdateUserInput,
  ): Promise<User | null> => {
    const exists = await prismaClient.auth_user.findUnique({ where: { id } });
    if (!exists) {
      return null;
    }

    const newRoles = input.roles;
    if (newRoles !== undefined && newRoles.length === 0) {
      throw new Error("UpdateUserInput.roles cannot be empty when provided");
    }

    const data: Prisma.auth_userUpdateInput = {};
    if (input.email !== undefined) {
      data.email = input.email;
    }
    if (input.name !== undefined) {
      data.name = input.name;
    }
    if (input.authenticated !== undefined) {
      data.authenticated = input.authenticated;
    }
    if (input.password !== undefined) {
      data.password = input.password;
    }

    const hasScalars = Object.keys(data).length > 0;
    const hasRoleReplace = newRoles !== undefined;

    if (!hasScalars && !hasRoleReplace) {
      const row = await prismaClient.auth_user.findUnique({
        where: { id },
        include: rolesInclude,
      });
      return row ? toDomain(row) : null;
    }

    if (hasRoleReplace && newRoles) {
      await prismaClient.$transaction(async (tx) => {
        await tx.auth_user_role.deleteMany({ where: { auth_user_id: id } });
        await tx.auth_user_role.createMany({
          data: newRoles.map((role) => ({
            auth_user_id: id,
            role,
          })),
        });
        if (hasScalars) {
          await tx.auth_user.update({ where: { id }, data });
        }
      });
    } else if (hasScalars) {
      await prismaClient.auth_user.update({ where: { id }, data });
    }

    const row = await prismaClient.auth_user.findUnique({
      where: { id },
      include: rolesInclude,
    });
    return row ? toDomain(row) : null;
  };

  public delete = async (id: string): Promise<boolean> => {
    try {
      await prismaClient.auth_user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  };
}
