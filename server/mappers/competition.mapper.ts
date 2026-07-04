import type {
  CreateCompetitionInput,
  UpdateCompetitionInput,
} from "~~/application/ports/competition-repository.port";
import type { Competition } from "~~/domain/competitions/competition";
import { seasonYearFromDate } from "~~/domain/utils";
import type {
  CompetitionCreateDto,
  CompetitionDto,
  CompetitionUpdateDto,
} from "~~/shared/competitions/competition.dto";
import { formatDateForDb, parseDbDateString } from "~~/shared/utils/dates";

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
): CreateCompetitionInput => {
  const startDate = parseDbDateString(dto.start_date);
  return {
    fileId: dto.file_id,
    name: dto.name,
    startDate,
    endDate: parseDbDateString(dto.end_date),
    place: dto.place,
    price: dto.price,
    category: dto.category,
    type: dto.type,
    isChampionship: dto.is_championship,
    seasonYear: seasonYearFromDate(startDate),
  };
};

export const toUpdateCompetitionInput = (
  dto: CompetitionUpdateDto,
): UpdateCompetitionInput => {
  const startDate = dto.start_date
    ? parseDbDateString(dto.start_date)
    : undefined;

  return {
    fileId: dto.file_id,
    name: dto.name,
    startDate,
    endDate: dto.end_date ? parseDbDateString(dto.end_date) : undefined,
    place: dto.place,
    price: dto.price,
    category: dto.category,
    type: dto.type,
    isChampionship: dto.is_championship,
    seasonYear:
      dto.season_year ??
      (startDate ? seasonYearFromDate(startDate) : undefined),
  };
};
