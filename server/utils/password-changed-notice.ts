import type { H3Event } from "h3";
import { SendPasswordChangedNotice } from "~~/application/user/send-password-changed-notice";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { MAILTRAP_TEMPLATES_IDS } from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { createMailtrapFromEvent } from "~~/server/utils/mailtrap-from-config";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

/**
 * Builds the best-effort password-changed notice. Unlike mail-essential flows
 * (invitation, forgot password), a password change must succeed even when
 * transactional mail is not configured, so a misconfigured Mailtrap yields a
 * notice without a sender instead of an HTTP error.
 */
export const createPasswordChangedNotice = (
  event: H3Event,
): SendPasswordChangedNotice => {
  const config = useRuntimeConfig(event);
  const accessSecret = config.authJwtAccessSecret;
  const refreshSecret = config.authJwtRefreshSecret;

  if (!accessSecret || !refreshSecret || accessSecret === refreshSecret) {
    throw ApiError(API_ERROR_REASON.auth.not_configured);
  }

  const authServices = createAuthServices({ accessSecret, refreshSecret });
  const { tokenRepository } = getRepositories();

  const mailtrap = createMailtrapFromEvent(event);

  return new SendPasswordChangedNotice(
    mailtrap.mail,
    authServices.jwt,
    tokenRepository,
    {
      fromEmail: mailtrap.fromEmail,
      fromName: mailtrap.fromName,
      templateId: MAILTRAP_TEMPLATES_IDS.passwordChanged,
      siteOrigin: mailtrap.siteOrigin,
    },
  );
};
