import { FindArcherById } from "~~/application/archer/find-archer-by-id.use-case";
import { InviteArcherShell } from "~~/application/user/invite-archer-shell.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { MAILTRAP_TEMPLATES_IDS } from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUserDto } from "~~/server/mappers/user.mapper";
import { ApiError } from "~~/server/utils/api-error";
import { createMailtrapFromEvent } from "~~/server/utils/mailtrap-from-config";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { RoleEnum } from "~~/shared/db-enums";
import type { InviteArcherShellResponseDto } from "~~/shared/invitation/invite-archer-shell.dto";
import {
  inviteArcherShellBodySchema,
  prepareInviteArcherShellBody,
} from "~~/shared/invitation/invite-archer-shell.schema";

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
  const parsed = inviteArcherShellBodySchema.safeParse(
    prepareInviteArcherShellBody(record),
  );

  if (!parsed.success) {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  const { archerRepository, tokenRepository, inviteMemberPersistence } =
    getRepositories();

  const findArcherByIdHandler = new FindArcherById(archerRepository);
  const archer = await findArcherByIdHandler.findById(parsed.data.archer_id);
  if (!archer) {
    throw ApiError(API_ERROR_REASON.common.not_found);
  }

  const authServices = createAuthServices({
    accessSecret,
    refreshSecret,
  });
  const mailtrap = createMailtrapFromEvent(event);

  const inviteArcherShellHandler = new InviteArcherShell(
    inviteMemberPersistence,
    tokenRepository,
    authServices.jwt,
    mailtrap.mail,
    {
      fromEmail: mailtrap.fromEmail,
      fromName: mailtrap.fromName,
      templateId: MAILTRAP_TEMPLATES_IDS.invitation,
      siteOrigin: mailtrap.siteOrigin,
    },
  );

  const result = await inviteArcherShellHandler.invite({
    archerId: parsed.data.archer_id,
    email: parsed.data.email,
    publicName: archer.publicName,
  });

  if (!result.ok) {
    throw ApiError(result.reason);
  }

  const response: InviteArcherShellResponseDto = {
    user: toUserDto(result.user),
    mail_sent: result.mailSent,
    resent: result.resent,
  };

  setResponseStatus(event, result.resent ? 200 : 201);
  return response;
});
