import { InviteMember } from "~~/application/user/invite-member.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import {
  createMailtrapTransactionalMailSender,
  MAILTRAP_TEMPLATES_IDS,
} from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUserDto } from "~~/server/mappers/user.mapper";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { RoleEnum } from "~~/shared/db-enums";
import type { InviteMemberResponseDto } from "~~/shared/invitation/invite-member.dto";
import {
  inviteMemberBodySchema,
  prepareInviteMemberBody,
} from "~~/shared/invitation/invite-member.schema";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);

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
    throw ApiError(API_ERROR_REASON.mail.not_configured);
  }

  if (!fromEmail) {
    throw ApiError(API_ERROR_REASON.mail.sender_not_configured);
  }

  if (!accessSecret || !refreshSecret || accessSecret === refreshSecret) {
    throw ApiError(API_ERROR_REASON.auth.not_configured);
  }

  let testInboxId: number | undefined;
  if (sandbox) {
    const parsedInbox = Number.parseInt(inboxIdRaw, 10);
    if (!Number.isFinite(parsedInbox) || parsedInbox <= 0) {
      throw ApiError(API_ERROR_REASON.mail.sandbox_inbox_not_configured);
    }
    testInboxId = parsedInbox;
  }

  const body = await readBody<Record<string, unknown>>(event);
  const record =
    typeof body === "object" && body !== null
      ? body
      : ({} as Record<string, unknown>);
  const parsed = inviteMemberBodySchema.safeParse(
    prepareInviteMemberBody(record),
  );

  if (!parsed.success) {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  const {
    userRepository,
    tokenRepository,
    inviteMemberPersistence,
    archerRepository,
  } = getRepositories();
  const authServices = createAuthServices({
    accessSecret,
    refreshSecret,
  });
  const mailSender = createMailtrapTransactionalMailSender({
    apiKey,
    sandbox,
    testInboxId,
  });

  const inviteOrigin = (config.passwordResetOrigin as string) || "";

  const inviteMemberHandler = new InviteMember(
    userRepository,
    archerRepository,
    inviteMemberPersistence,
    tokenRepository,
    authServices.jwt,
    mailSender,
    {
      fromEmail,
      fromName,
      templateId: MAILTRAP_TEMPLATES_IDS.invitation,
      inviteOrigin,
    },
  );

  const result = await inviteMemberHandler.invite({
    name: parsed.data.name,
    email: parsed.data.email,
    allowResent: parsed.data.allow_resent === true,
  });

  if (!result.ok) {
    throw ApiError(result.reason);
  }

  const response: InviteMemberResponseDto = {
    user: toUserDto(result.user),
    mail_sent: result.mailSent,
    resent: result.resent,
  };

  setResponseStatus(event, result.resent ? 200 : 201);
  return response;
});
