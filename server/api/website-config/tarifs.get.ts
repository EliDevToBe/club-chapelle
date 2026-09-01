import { GetTarifs } from "~~/application/website/get-tarifs.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { DEFAULT_TARIFS } from "~~/shared/website/tarifs.seed";

export default defineEventHandler(async () => {
  const { websiteConfigRepository } = getRepositories();
  const getTarifsHandler = new GetTarifs(
    websiteConfigRepository,
    DEFAULT_TARIFS,
  );
  const settings = await getTarifsHandler.get();

  return {
    settings,
  };
});
