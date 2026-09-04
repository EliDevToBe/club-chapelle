import { createError } from "h3";
import { InviteMember } from "~~/application/user/invite-member.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import {
  createMailtrapTransactionalMailSender,
  MAILTRAP_TEMPLATES_IDS,
} from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUserDto } from "~~/server/mappers/user.mapper";
import { requireRoles } from "~~/server/utils/rbac";
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
    const parsedInbox = Number.parseInt(inboxIdRaw, 10);
    if (!Number.isFinite(parsedInbox) || parsedInbox <= 0) {
      throw createError({
        statusCode: 500,
        statusMessage: "Mail sandbox inbox is not configured",
      });
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
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request",
    });
  }

  const { userRepository, tokenRepository, inviteMemberPersistence } =
    getRepositories();
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
    if (result.reason === "already_authenticated") {
      throw createError({
        statusCode: 409,
        statusMessage: "Account already active",
      });
    }
    if (result.reason === "already_invited") {
      throw createError({
        statusCode: 409,
        statusMessage: "Account already invited",
      });
    }
    if (result.reason === "public_name_taken") {
      throw createError({
        statusCode: 409,
        statusMessage: "Public name already taken",
      });
    }
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request",
    });
  }

  const response: InviteMemberResponseDto = {
    user: toUserDto(result.user),
    mail_sent: result.mailSent,
    resent: result.resent,
  };

  setResponseStatus(event, result.resent ? 200 : 201);
  return response;
});
