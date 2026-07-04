import type {
  ArcherRepository,
  CreateArcherInput,
  FindArchersPageInput,
  UpdateArcherInput,
} from "~~/application/ports/archer-repository.port";
import type { Archer } from "~~/domain/archer/archer";
import type { archer, Prisma } from "~~/generated/prisma/client";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

const toDomain = (row: archer): Archer => ({
  id: row.id,
  publicName: row.public_name,
  authUserId: row.auth_user_id,
  createdAt: row.created_at,
  offboardedAt: row.offboarded_at,
});

export class PrismaArcherRepository implements ArcherRepository {
  public create = async (input: CreateArcherInput): Promise<Archer> => {
    const row = await prismaClient.archer.create({
      data: {
        public_name: input.publicName,
        auth_user_id: input.authUserId,
        offboarded_at: input.offboardedAt,
      },
    });

    return toDomain(row);
  };

  public findById = async (id: string): Promise<Archer | null> => {
    const row = await prismaClient.archer.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  };

  public findMany = async (): Promise<Archer[]> => {
    const rows = await prismaClient.archer.findMany({
      orderBy: { created_at: "desc" },
    });
    return rows.map(toDomain);
  };

  public findPage = async (input: FindArchersPageInput) => {
    const where: Prisma.archerWhereInput = {};

    if (!input.includeOffboarded) {
      where.offboarded_at = null;
    }

    const trimmedQuery = input.search?.trim();
    if (trimmedQuery) {
      where.public_name = {
        contains: trimmedQuery,
        mode: "insensitive",
      };
    }

    const [rows, total] = await Promise.all([
      prismaClient.archer.findMany({
        where,
        orderBy: { public_name: "asc" },
        skip: input.offset,
        take: input.limit,
      }),
      prismaClient.archer.count({ where }),
    ]);

    return {
      items: rows.map(toDomain),
      total,
    };
  };

  public update = async (
    id: string,
    input: UpdateArcherInput,
  ): Promise<Archer | null> => {
    const exists = await prismaClient.archer.findUnique({ where: { id } });
    if (!exists) {
      return null;
    }

    const row = await prismaClient.archer.update({
      where: { id },
      data: {
        public_name: input.publicName,
        auth_user_id: input.authUserId,
        offboarded_at: input.offboardedAt,
      },
    });
    return row ? toDomain(row) : null;
  };

  public delete = async (id: string): Promise<boolean> => {
    const result = await prismaClient.archer.deleteMany({ where: { id } });
    return result.count > 0;
  };
}
