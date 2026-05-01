import type {
  Competition,
  CompetitionId,
} from "~~/domain/competitions/competition";
import type {
  CompetitionCategoryEnum,
  CompetitionTypeEnum,
} from "~~/shared/db-enums";

export type CreateCompetitionInput = {
  fileId?: string | null;
  name: string;
  startDate: Date;
  endDate: Date;
  place?: string | null;
  price: string;
  category: CompetitionCategoryEnum;
  type: CompetitionTypeEnum;
  isChampionship?: boolean;
  seasonYear: number;
};

export type UpdateCompetitionInput = {
  fileId?: string | null;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  place?: string | null;
  price?: string;
  category?: CompetitionCategoryEnum;
  type?: CompetitionTypeEnum;
  isChampionship?: boolean;
  seasonYear?: number;
};

/** Calendar bounds for browse overlap (`YYYY-MM-DD` or null = unbounded on that side). */
export type CompetitionBrowseDateFilter = {
  startDateYmd: string | null;
  endDateYmd: string | null;
};

export interface CompetitionRepository {
  create: (input: CreateCompetitionInput) => Promise<Competition>;
  findById: (id: CompetitionId) => Promise<Competition | null>;
  findMany: () => Promise<Competition[]>;
  findManyForListing: (
    filter: CompetitionBrowseDateFilter,
  ) => Promise<Competition[]>;
  update: (
    id: CompetitionId,
    input: UpdateCompetitionInput,
  ) => Promise<Competition | null>;
  delete: (id: CompetitionId) => Promise<boolean>;
}
