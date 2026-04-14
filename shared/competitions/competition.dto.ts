import type {
  CompetitionCategoryEnum,
  CompetitionTypeEnum,
} from "~~/shared/db-enums";

/** Full `competition` row shape for APIs and serialization (dates as ISO `YYYY-MM-DD`). */
export type CompetitionDto = {
  id: string;
  file_id: string | null;
  name: string;
  start_date: string;
  end_date: string;
  place: string | null;
  /** DECIMAL(8,2) serialized as string to avoid float drift. */
  price: string;
  category: CompetitionCategoryEnum;
  type: CompetitionTypeEnum;
  is_championship: boolean;
  season_year: number;
  created_at: string;
};

export type CompetitionCreateDto = {
  file_id?: string | null;
  name: string;
  start_date: string;
  end_date: string;
  place?: string | null;
  price: string;
  category: CompetitionCategoryEnum;
  type: CompetitionTypeEnum;
  is_championship?: boolean;
  season_year: number;
};

export type CompetitionUpdateDto = Partial<CompetitionCreateDto>;
