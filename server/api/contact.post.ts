import { createError } from "h3";
import { SubmitContactMessage } from "~~/application/contact/submit-contact-message.use-case";
import { GetSiteSettings } from "~~/application/website/get-site-settings.use-case";
import { createMailtrapTransactionalMailSender } from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { buildSiteSettingsSeed } from "~~/server/utils/site-settings-seed";

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

  const seed = buildSiteSettingsSeed(event);
  const { websiteConfigRepository } = getRepositories();
  const getSiteSettingsHandler = new GetSiteSettings(
    websiteConfigRepository,
    seed,
  );
  const siteSettings = await getSiteSettingsHandler.get();
  const toEmail = siteSettings.contact_email;

  if (!toEmail) {
    throw createError({
      statusCode: 500,
      statusMessage: "Contact recipient is not configured",
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
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid form data",
    });
  }

  throw createError({
    statusCode: 502,
    statusMessage: "Failed to send message",
  });
});
