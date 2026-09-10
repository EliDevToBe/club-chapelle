import type { H3Event } from "h3";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import { createMailtrapTransactionalMailSender } from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { ApiError } from "~~/server/utils/api-error";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export const createMailtrapFromEvent = (
  event: H3Event,
): {
  mail: TransactionalMailPort;
  fromEmail: string;
  fromName: string;
  siteOrigin: string;
} => {
  const config = useRuntimeConfig(event);
  const {
    mailtrapApiKey: apiKey,
    mailtrapInboxId: inboxIdRaw,
    mailtrapFromEmail: fromEmail,
    mailtrapFromName: fromName,
  } = config;
  const sandbox = Boolean(config.mailtrapUseSandbox);

  if (!apiKey) {
    throw ApiError(API_ERROR_REASON.mail.not_configured);
  }
  if (!fromEmail) {
    throw ApiError(API_ERROR_REASON.mail.sender_not_configured);
  }

  let testInboxId: number | undefined;
  if (sandbox) {
    const parsed = Number.parseInt(inboxIdRaw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw ApiError(API_ERROR_REASON.mail.sandbox_inbox_not_configured);
    }
    testInboxId = parsed;
  }

  return {
    mail: createMailtrapTransactionalMailSender({
      apiKey,
      sandbox,
      testInboxId,
    }),
    fromEmail,
    fromName,
    siteOrigin: (config.baseUrl as string) || "",
  };
};
