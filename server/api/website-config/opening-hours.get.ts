import { GetOpeningHours } from "~~/application/website/get-opening-hours.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { DEFAULT_OPENING_HOURS } from "~~/shared/website/opening-hours.seed";

export default defineEventHandler(async () => {
  const { websiteConfigRepository } = getRepositories();
  const getOpeningHoursHandler = new GetOpeningHours(
    websiteConfigRepository,
    DEFAULT_OPENING_HOURS,
  );
  const settings = await getOpeningHoursHandler.get();

  return {
    settings,
  };
});
