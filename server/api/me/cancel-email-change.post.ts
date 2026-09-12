import { CancelChangeEmail } from "~~/application/user/cancel-change-email.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { requireAuthenticated } from "~~/server/utils/rbac";

export default defineEventHandler(async (event) => {
  const authUser = requireAuthenticated(event);

  const { tokenRepository } = getRepositories();
  const cancelChangeEmailHandler = new CancelChangeEmail(tokenRepository);

  const result = await cancelChangeEmailHandler.cancel({
    userId: authUser.id,
  });
  if (!result.ok) {
    throw ApiError(result.reason);
  }

  return { ok: true };
});
