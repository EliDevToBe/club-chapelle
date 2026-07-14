import { createError } from "h3";
import { authForgotPasswordFormSchema } from "~~/app/schemas/auth-flow.zod";
import { RequestForgotPassword } from "~~/application/user/request-forgot-password.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import {
  createMailtrapTransactionalMailSender,
  MAILTRAP_TEMPLATES_IDS,
} from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { asStringOrEmpty } from "~~/shared/utils/base-string.helper";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const {
    mailtrapApiKey: apiKey,
    mailtrapInboxId: inboxIdRaw,
    mailtrapFromEmail: fromEmail,
    mailtrapFromName: fromName,
    authJwtAccessSecret: accessSecret,
    authJwtRefreshSecret: refreshSecret,
  } = config;
  const sandbox = Boolean(config.mailtrapUseSandbox);

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Mail is not configured",
    });
  }

  if (!fromEmail) {
    throw createError({
      statusCode: 500,
      statusMessage: "Mail sender is not configured",
    });
  }

  if (!accessSecret || !refreshSecret || accessSecret === refreshSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: "Authentication is not configured",
    });
  }

  let testInboxId: number | undefined;
  if (sandbox) {
    const parsed = Number.parseInt(inboxIdRaw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw createError({
        statusCode: 500,
        statusMessage: "Mail sandbox inbox is not configured",
      });
    }
    testInboxId = parsed;
  }

  const body = await readBody<Record<string, unknown>>(event);
  const parsed = authForgotPasswordFormSchema.safeParse({
    email: asStringOrEmpty(body.email),
  });

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid email",
    });
  }

  const { userRepository, tokenRepository } = getRepositories();
  const authServices = createAuthServices({
    accessSecret,
    refreshSecret,
  });
  const mailSender = createMailtrapTransactionalMailSender({
    apiKey,
    sandbox,
    testInboxId,
  });

  const templateId = MAILTRAP_TEMPLATES_IDS.forgotPassword;

  const passwordResetOrigin = (config.passwordResetOrigin as string) || "";

  const requestForgotPasswordHandler = new RequestForgotPassword(
    userRepository,
    tokenRepository,
    authServices.jwt,
    mailSender,
    {
      fromEmail,
      fromName,
      templateId,
      passwordResetOrigin,
      sandbox,
    },
  );

  await requestForgotPasswordHandler.request({ email: parsed.data.email });

  return { ok: true };
});
