import { createError } from "h3";
import { authResetPasswordBodySchema } from "~~/app/schemas/auth-flow.zod";
import { ResetPassword } from "~~/application/user/reset-password.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { setAuthSessionCookies } from "~~/server/utils/auth-cookies";
import { asStringOrEmpty } from "~~/shared/utils/base-string.helper";

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

  const body = await readBody<Record<string, unknown>>(event);
  const parsed = authResetPasswordBodySchema.safeParse({
    token: asStringOrEmpty(body.token),
    password: asStringOrEmpty(body.password),
    confirmPassword: asStringOrEmpty(body.confirmPassword),
  });

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request",
    });
  }

  const { userRepository, passwordResetPersistence } = getRepositories();
  const authServices = createAuthServices({
    accessSecret,
    refreshSecret,
  });
  const resetPasswordHandler = new ResetPassword(
    userRepository,
    authServices.password,
    authServices.jwt,
    passwordResetPersistence,
  );
  const result = await resetPasswordHandler.reset({
    token: parsed.data.token,
    password: parsed.data.password,
  });

  if (!result.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: result.reason,
    });
  }

  setAuthSessionCookies(event, result.accessToken, result.refreshToken);
  return { ok: true, session: result.session };
});
