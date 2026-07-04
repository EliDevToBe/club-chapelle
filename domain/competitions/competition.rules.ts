import type {
  CompetitionCategoryEnum,
  CompetitionTypeEnum,
} from "~~/shared/db-enums";

const INDOOR_ALLOWED_TYPES: readonly CompetitionTypeEnum[] = ["olympic", "d3"];

const OUTDOOR_ALLOWED_TYPES: readonly CompetitionTypeEnum[] = [
  "olympic",
  "beursault",
  "field",
  "nature",
  "d3",
];

export const allowedCompetitionTypesForCategory = (
  category: CompetitionCategoryEnum,
): CompetitionTypeEnum[] => {
  if (category === "indoor") {
    return [...INDOOR_ALLOWED_TYPES];
  }
  return [...OUTDOOR_ALLOWED_TYPES];
};
