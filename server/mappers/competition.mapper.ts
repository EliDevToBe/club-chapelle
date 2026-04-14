import type {
  CreateCompetitionInput,
  UpdateCompetitionInput,
} from "~~/application/ports/competition-repository.port";
import type { Competition } from "~~/domain/competitions/competition";
import type {
  CompetitionCreateDto,
  CompetitionDto,
  CompetitionUpdateDto,
} from "~~/shared/competitions/competition.dto";
import { formatDateForDb } from "~~/shared/utils";

const parseDate = (value: string): Date => new Date(value);

export const toCompetitionDto = (competition: Competition): CompetitionDto => ({
  id: competition.id,
  file_id: competition.fileId,
  name: competition.name,
  start_date: formatDateForDb(competition.startDate),
  end_date: formatDateForDb(competition.endDate),
  place: competition.place,
  price: competition.price,
  category: competition.category,
  type: competition.type,
  is_championship: competition.isChampionship,
  season_year: competition.seasonYear,
  created_at: formatDateForDb(competition.createdAt),
});

export const toCreateCompetitionInput = (
  dto: CompetitionCreateDto,
): CreateCompetitionInput => ({
  fileId: dto.file_id,
  name: dto.name,
  startDate: parseDate(dto.start_date),
  endDate: parseDate(dto.end_date),
  place: dto.place,
  price: dto.price,
  category: dto.category,
  type: dto.type,
  isChampionship: dto.is_championship,
  seasonYear: dto.season_year,
});

export const toUpdateCompetitionInput = (
  dto: CompetitionUpdateDto,
): UpdateCompetitionInput => ({
  fileId: dto.file_id,
  name: dto.name,
  startDate: dto.start_date ? parseDate(dto.start_date) : undefined,
  endDate: dto.end_date ? parseDate(dto.end_date) : undefined,
  place: dto.place,
  price: dto.price,
  category: dto.category,
  type: dto.type,
  isChampionship: dto.is_championship,
  seasonYear: dto.season_year,
});
