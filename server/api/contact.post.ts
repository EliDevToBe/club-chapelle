import { SubmitContactMessage } from "~~/application/contact/submit-contact-message.use-case";
import { GetSiteSettings } from "~~/application/website/get-site-settings.use-case";
import { createMailtrapTransactionalMailSender } from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { buildSiteSettingsSeed } from "~~/server/utils/site-settings-seed";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiKey = config.mailtrapApiKey;
  const sandbox = Boolean(config.mailtrapUseSandbox);
  const inboxIdRaw = config.mailtrapInboxId;
  const fromEmail = config.mailtrapFromEmail;
  const fromName = config.mailtrapFromName;

  if (!apiKey) {
    throw ApiError(API_ERROR_REASON.mail.not_configured);
  }

  if (!fromEmail) {
    throw ApiError(API_ERROR_REASON.mail.sender_not_configured);
  }

  const seed = buildSiteSettingsSeed(event);
  const { websiteConfigRepository } = getRepositories();
  const getSiteSettingsHandler = new GetSiteSettings(
    websiteConfigRepository,
    seed,
  );
  const siteSettings = await getSiteSettingsHandler.get();
  const toEmail = siteSettings.contact_email;

  if (!toEmail) {
    throw ApiError(API_ERROR_REASON.contact.recipient_not_configured);
  }

  let testInboxId: number | undefined;
  if (sandbox) {
    const parsed = Number.parseInt(inboxIdRaw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw ApiError(API_ERROR_REASON.mail.sandbox_inbox_not_configured);
    }
    testInboxId = parsed;
  }

  const body = await readBody<ContactBody>(event);

  const mailSender = createMailtrapTransactionalMailSender({
    apiKey,
    sandbox,
    testInboxId,
  });

  const submitContactMessageHandler = new SubmitContactMessage(mailSender, {
    toEmail,
    fromEmail,
    fromName,
    sandbox,
  });

  const result = await submitContactMessageHandler.submit({
    name: body.name ?? "",
    email: body.email ?? "",
    subject: body.subject ?? "",
    message: body.message ?? "",
  });

  if (result.ok) {
    return { ok: true };
  }

  if (result.error === "validation") {
    throw ApiError(API_ERROR_REASON.contact.invalid_form_data);
  }

  throw ApiError(API_ERROR_REASON.mail.send_failed);
});
