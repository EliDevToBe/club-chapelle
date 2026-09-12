import { enrichSessionPublicName } from "~~/application/user/enrich-session-public-name";
import { UpdateOwnProfile } from "~~/application/user/update-own-profile.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { requireAuthenticated } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { parseOwnProfileNameBody } from "~~/shared/user/own-profile.schema";

export default defineEventHandler(async (event) => {
  const authUser = requireAuthenticated(event);
  const body = await readBody<Record<string, unknown>>(event);

  try {
    const parsed = parseOwnProfileNameBody(body);
    const { userRepository, archerRepository } = getRepositories();
    const updateOwnProfileHandler = new UpdateOwnProfile(userRepository);

    const result = await updateOwnProfileHandler.update({
      userId: authUser.id,
      name: parsed.name,
    });
    if (!result.ok) {
      throw ApiError(result.reason);
    }

    const session = await enrichSessionPublicName(
      {
        id: result.user.id,
        name: result.user.name,
        public_name: null,
        roles: result.user.roles,
      },
      archerRepository,
    );
    return { ok: true, session };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }
});
