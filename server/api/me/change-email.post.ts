import { IssueChangeEmailOtp } from "~~/application/user/issue-change-email-otp";
import { RequestChangeEmail } from "~~/application/user/request-change-email.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { MAILTRAP_TEMPLATES_IDS } from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { createMailtrapFromEvent } from "~~/server/utils/mailtrap-from-config";
import { requireAuthenticated } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { parseOwnChangeEmailBody } from "~~/shared/user/own-profile.schema";

export default defineEventHandler(async (event) => {
  const authUser = requireAuthenticated(event);
  const config = useRuntimeConfig(event);
  const accessSecret = config.authJwtAccessSecret;
  const refreshSecret = config.authJwtRefreshSecret;
  if (!accessSecret || !refreshSecret || accessSecret === refreshSecret) {
    throw ApiError(API_ERROR_REASON.auth.not_configured);
  }

  const body = await readBody<Record<string, unknown>>(event);
  try {
    const parsed = parseOwnChangeEmailBody(body);
    const { userRepository, tokenRepository } = getRepositories();
    const authServices = createAuthServices({
      accessSecret,
      refreshSecret,
    });
    const mailtrap = createMailtrapFromEvent(event);
    const issueOtp = new IssueChangeEmailOtp(
      tokenRepository,
      authServices.password,
      mailtrap.mail,
      {
        fromEmail: mailtrap.fromEmail,
        fromName: mailtrap.fromName,
        templateId: MAILTRAP_TEMPLATES_IDS.changeEmail,
        siteOrigin: mailtrap.siteOrigin,
      },
    );

    const requestChangeEmailHandler = new RequestChangeEmail(
      userRepository,
      authServices.password,
      issueOtp,
    );

    const result = await requestChangeEmailHandler.request({
      userId: authUser.id,
      currentPassword: parsed.current_password,
      email: parsed.email,
    });
    if (!result.ok) {
      throw ApiError(result.reason);
    }

    return { ok: true };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }
});
