import type {
  CreateParticipationInput,
  ParticipationRepository,
  ParticipationWithArcherSummary,
  UpdateParticipationInput,
} from "~~/application/ports/participation-repository.port";
import type { Participation } from "~~/domain/participations/participation";
import type { participation } from "~~/generated/prisma/client";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

const toDomain = (row: participation): Participation => ({
  id: row.id,
  archerId: row.archer_id,
  competitionId: row.competition_id,
  registrationStatus: row.registration_status,
  paymentStatus: row.payment_status,
  payer: row.payer,
  distance: row.distance,
  target: row.target,
  weapon: row.weapon,
  createdAt: row.created_at,
});

export class PrismaParticipationRepository implements ParticipationRepository {
  public create = async (
    input: CreateParticipationInput,
  ): Promise<Participation> => {
    const row = await prismaClient.participation.create({
      data: {
        archer_id: input.archerId,
        competition_id: input.competitionId,
        registration_status: input.registrationStatus,
        payment_status: input.paymentStatus,
        payer: input.payer,
        distance: input.distance,
        target: input.target,
        weapon: input.weapon,
      },
    });

    return toDomain(row);
  };

  public findById = async (id: string): Promise<Participation | null> => {
    const row = await prismaClient.participation.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  };

  public findMany = async (): Promise<Participation[]> => {
    const rows = await prismaClient.participation.findMany({
      orderBy: { created_at: "desc" },
    });
    return rows.map(toDomain);
  };

  public findManyWithArcherSummary = async (
    competitionIds?: readonly string[],
  ): Promise<ParticipationWithArcherSummary[]> => {
    if (competitionIds !== undefined && competitionIds.length === 0) {
      return [];
    }

    const where =
      competitionIds === undefined
        ? undefined
        : { competition_id: { in: [...competitionIds] } };

    const rows = await prismaClient.participation.findMany({
      where,
      include: {
        archer: {
          select: {
            public_name: true,
            auth_user_id: true,
          },
        },
      },
      orderBy: [
        { competition_id: "asc" },
        { archer: { public_name: "asc" } },
        { created_at: "asc" },
      ],
    });

    return rows.map((row) => {
      const { archer, ...participationRow } = row;
      return {
        ...toDomain(participationRow),
        archerPublicName: archer.public_name,
        archerAuthUserId: archer.auth_user_id,
      };
    });
  };

  public update = async (
    id: string,
    input: UpdateParticipationInput,
  ): Promise<Participation | null> => {
    const exists = await prismaClient.participation.findUnique({
      where: { id },
    });
    if (!exists) {
      return null;
    }

    const row = await prismaClient.participation.update({
      where: { id },
      data: {
        registration_status: input.registrationStatus,
        payment_status: input.paymentStatus,
        payer: input.payer,
        distance: input.distance,
        target: input.target,
        weapon: input.weapon,
      },
    });
    return row ? toDomain(row) : null;
  };

  public delete = async (id: string): Promise<boolean> => {
    const result = await prismaClient.participation.deleteMany({
      where: { id },
    });
    return result.count > 0;
  };
}
