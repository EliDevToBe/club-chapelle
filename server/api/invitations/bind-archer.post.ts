import { createError } from "h3";
import { FindArcherById } from "~~/application/archer/find-archer-by-id.use-case";
import { InviteArcherShell } from "~~/application/user/invite-archer-shell.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import {
  createMailtrapTransactionalMailSender,
  MAILTRAP_TEMPLATES_IDS,
} from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUserDto } from "~~/server/mappers/user.mapper";
import { requireRoles } from "~~/server/utils/rbac";
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
  const parsed = inviteArcherShellBodySchema.safeParse(
    prepareInviteArcherShellBody(record),
  );

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request",
    });
  }

  const { archerRepository, tokenRepository, inviteMemberPersistence } =
    getRepositories();

  const findArcherByIdHandler = new FindArcherById(archerRepository);
  const archer = await findArcherByIdHandler.findById(parsed.data.archer_id);
  if (!archer) {
    throw createError({
      statusCode: 404,
      statusMessage: "Archer not found",
    });
  }

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

  const inviteArcherShellHandler = new InviteArcherShell(
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

  const result = await inviteArcherShellHandler.invite({
    archerId: parsed.data.archer_id,
    email: parsed.data.email,
    publicName: archer.publicName,
  });

  if (!result.ok) {
    if (result.reason === "already_authenticated") {
      throw createError({
        statusCode: 409,
        statusMessage: "Account already active",
      });
    }
    if (result.reason === "archer_already_linked") {
      throw createError({
        statusCode: 409,
        statusMessage: "Archer already linked",
      });
    }
    if (result.reason === "email_linked_elsewhere") {
      throw createError({
        statusCode: 409,
        statusMessage: "Email already linked to another archer",
      });
    }
    if (result.reason === "archer_not_found") {
      throw createError({
        statusCode: 404,
        statusMessage: "Archer not found",
      });
    }
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request",
    });
  }

  const response: InviteArcherShellResponseDto = {
    user: toUserDto(result.user),
    mail_sent: result.mailSent,
    resent: result.resent,
  };

  setResponseStatus(event, result.resent ? 200 : 201);
  return response;
});
