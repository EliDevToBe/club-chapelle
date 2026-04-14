import type {
  CompetitionCategoryEnum,
  CompetitionTypeEnum,
} from "~~/shared/db-enums";

export type CompetitionId = string;

export type Competition = {
  id: CompetitionId;
  fileId: string | null;
  name: string;
  startDate: Date;
  endDate: Date;
  place: string | null;
  /** Decimal string, e.g. from Prisma `Decimal`. */
  price: string;
  category: CompetitionCategoryEnum;
  type: CompetitionTypeEnum;
  isChampionship: boolean;
  seasonYear: number;
  createdAt: Date;
};
