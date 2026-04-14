import type {
  ArcherRepository,
  CreateArcherInput,
  UpdateArcherInput,
} from "~~/application/ports/archer-repository.port";
import type { Archer } from "~~/domain/archer/archer";
import type { archer } from "~~/generated/prisma/client";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

const toDomain = (row: archer): Archer => ({
  id: row.id,
  name: row.name,
  authUserId: row.auth_user_id,
  createdAt: row.created_at,
  offboardedAt: row.offboarded_at,
});

export class PrismaArcherRepository implements ArcherRepository {
  public create = async (input: CreateArcherInput): Promise<Archer> => {
    const row = await prismaClient.archer.create({
      data: {
        name: input.name,
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
        name: input.name,
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
