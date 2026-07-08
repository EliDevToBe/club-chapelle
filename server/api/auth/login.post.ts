import { createError } from "h3";
import { LoginUser } from "~~/application/user/login-user.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { setAuthSessionCookies } from "~~/server/utils/auth-cookies";

type LoginBody = {
  email?: string;
  password?: string;
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const accessSecret = config.authJwtAccessSecret;
  const refreshSecret = config.authJwtRefreshSecret;
  if (!accessSecret || !refreshSecret || accessSecret === refreshSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: "Authentication is not configured",
    });
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
    throw createError({
      statusCode: 401,
      statusMessage: result.reason,
    });
  }

  setAuthSessionCookies(event, result.accessToken, result.refreshToken);
  return { ok: true, session: result.session };
});
