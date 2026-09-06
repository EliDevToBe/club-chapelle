import { LoginUser } from "~~/application/user/login-user.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { setAuthSessionCookies } from "~~/server/utils/auth-cookies";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

type LoginBody = {
  email?: string;
  password?: string;
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const accessSecret = config.authJwtAccessSecret;
  const refreshSecret = config.authJwtRefreshSecret;
  if (!accessSecret || !refreshSecret || accessSecret === refreshSecret) {
    throw ApiError(API_ERROR_REASON.auth.not_configured);
  }

  const body = await readBody<LoginBody>(event);
  const { userRepository } = getRepositories();
  const authServices = createAuthServices({
    accessSecret,
    refreshSecret,
  });
  const loginUserHandler = new LoginUser(
    userRepository,
    authServices.password,
    authServices.jwt,
  );
  const result = await loginUserHandler.login({
    email: body.email ?? "",
    password: body.password ?? "",
  });

  if (!result.ok) {
    throw ApiError(result.reason);
  }

  setAuthSessionCookies(event, result.accessToken, result.refreshToken);
  return { ok: true, session: result.session };
});
