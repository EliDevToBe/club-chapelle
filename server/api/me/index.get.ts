import { GetOwnProfile } from "~~/application/user/get-own-profile.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { requireAuthenticated } from "~~/server/utils/rbac";

export default defineEventHandler(async (event) => {
  const authUser = requireAuthenticated(event);

  const { userRepository, archerRepository, tokenRepository } =
    getRepositories();
  const getOwnProfileHandler = new GetOwnProfile(
    userRepository,
    archerRepository,
    tokenRepository,
  );
  const result = await getOwnProfileHandler.get(authUser.id);
  if (!result.ok) {
    throw ApiError(result.reason);
  }

  return result.profile;
});
