import { SubmitContactMessage } from "~~/application/contact/submit-contact-message.use-case";
import { GetSiteSettings } from "~~/application/website/get-site-settings.use-case";
import { MAILTRAP_TEMPLATES_IDS } from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { createMailtrapFromEvent } from "~~/server/utils/mailtrap-from-config";
import { buildSiteSettingsSeed } from "~~/server/utils/site-settings-seed";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export default defineEventHandler(async (event) => {
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

  const body = await readBody<ContactBody>(event);
  const mailtrap = createMailtrapFromEvent(event);

  const submitContactMessageHandler = new SubmitContactMessage(mailtrap.mail, {
    toEmail,
    fromEmail: mailtrap.fromEmail,
    fromName: mailtrap.fromName,
    templateId: MAILTRAP_TEMPLATES_IDS.contact,
    inviteOrigin: mailtrap.siteOrigin,
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
