import type {
  CompetitionRepository,
  CreateCompetitionInput,
  UpdateCompetitionInput,
} from "~~/application/ports/competition-repository.port";
import type { Competition } from "~~/domain/competitions/competition";
import type { competition } from "~~/generated/prisma/client";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

const toDomain = (row: competition): Competition => ({
  id: row.id,
  fileId: row.file_id,
  name: row.name,
  startDate: row.start_date,
  endDate: row.end_date,
  place: row.place,
  price: row.price.toString(),
  category: row.category,
  type: row.type,
  isChampionship: row.is_championship,
  seasonYear: row.season_year,
  createdAt: row.created_at,
});

export class PrismaCompetitionRepository implements CompetitionRepository {
  public create = async (
    input: CreateCompetitionInput,
  ): Promise<Competition> => {
    const row = await prismaClient.competition.create({
      data: {
        file_id: input.fileId,
        name: input.name,
        start_date: input.startDate,
        end_date: input.endDate,
        place: input.place,
        price: input.price,
        category: input.category,
        type: input.type,
        is_championship: input.isChampionship,
        season_year: input.seasonYear,
      },
    });

    return toDomain(row);
  };

  public findById = async (id: string): Promise<Competition | null> => {
    const row = await prismaClient.competition.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  };

  public findMany = async (): Promise<Competition[]> => {
    const rows = await prismaClient.competition.findMany({
      orderBy: [{ start_date: "asc" }, { name: "asc" }],
    });
    return rows.map(toDomain);
  };

  public update = async (
    id: string,
    input: UpdateCompetitionInput,
  ): Promise<Competition | null> => {
    const exists = await prismaClient.competition.findUnique({ where: { id } });
    if (!exists) {
      return null;
    }

    const row = await prismaClient.competition.update({
      where: { id },
      data: {
        file_id: input.fileId,
        name: input.name,
        start_date: input.startDate,
        end_date: input.endDate,
        place: input.place,
        price: input.price,
        category: input.category,
        type: input.type,
        is_championship: input.isChampionship,
        season_year: input.seasonYear,
      },
    });
    return row ? toDomain(row) : null;
  };

  public delete = async (id: string): Promise<boolean> => {
    const result = await prismaClient.competition.deleteMany({ where: { id } });
    return result.count > 0;
  };
}
