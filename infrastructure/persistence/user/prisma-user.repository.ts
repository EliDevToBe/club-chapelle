import type {
  CreateUserInput,
  UpdateUserInput,
  UserRepository,
} from "~~/application/ports/user-repository.port";
import type { User } from "~~/domain/user/user";
import type { auth_user } from "~~/generated/prisma/client";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

const toDomain = (row: auth_user): User => ({
  id: row.id,
  email: row.email,
  role: row.role,
  authenticated: row.authenticated,
  createdAt: row.created_at,
});

export class PrismaUserRepository implements UserRepository {
  public create = async (input: CreateUserInput): Promise<User> => {
    const row = await prismaClient.auth_user.create({
      data: {
        email: input.email,
        role: input.role,
        authenticated: input.authenticated,
        password: input.password,
      },
    });

    return toDomain(row);
  };

  public findById = async (id: string): Promise<User | null> => {
    const row = await prismaClient.auth_user.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  };

  public findMany = async (): Promise<User[]> => {
    const rows = await prismaClient.auth_user.findMany({
      orderBy: { created_at: "desc" },
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

    const row = await prismaClient.auth_user.update({
      where: { id },
      data: {
        email: input.email,
        role: input.role,
        authenticated: input.authenticated,
        password: input.password,
      },
    });
    return row ? toDomain(row) : null;
  };

  public delete = async (id: string): Promise<boolean> => {
    const result = await prismaClient.auth_user.deleteMany({ where: { id } });
    return result.count > 0;
  };
}
