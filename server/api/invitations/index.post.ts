import { InviteMember } from "~~/application/user/invite-member.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { MAILTRAP_TEMPLATES_IDS } from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUserDto } from "~~/server/mappers/user.mapper";
import { ApiError } from "~~/server/utils/api-error";
import { createMailtrapFromEvent } from "~~/server/utils/mailtrap-from-config";
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
  const accessSecret = config.authJwtAccessSecret;
  const refreshSecret = config.authJwtRefreshSecret;

  if (!accessSecret || !refreshSecret || accessSecret === refreshSecret) {
    throw ApiError(API_ERROR_REASON.auth.not_configured);
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
  const mailtrap = createMailtrapFromEvent(event);

  const inviteMemberHandler = new InviteMember(
    userRepository,
    archerRepository,
    inviteMemberPersistence,
    tokenRepository,
    authServices.jwt,
    mailtrap.mail,
    {
      fromEmail: mailtrap.fromEmail,
      fromName: mailtrap.fromName,
      templateId: MAILTRAP_TEMPLATES_IDS.invitation,
      inviteOrigin: mailtrap.siteOrigin,
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
