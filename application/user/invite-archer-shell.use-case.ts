import type { InviteMemberPersistence } from "~~/application/ports/invite-member-persistence.port";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import {
  SendInvitationEmail,
  type SendInvitationEmailOptions,
} from "~~/application/user/send-invitation-email";
import type { User } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export type InviteArcherShellResult =
  | { ok: true; user: User; mailSent: boolean; resent: boolean }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.common.invalid_request
        | typeof API_ERROR_REASON.common.not_found
        | typeof API_ERROR_REASON.invitation.archer_already_linked
        | typeof API_ERROR_REASON.invitation.account_already_active
        | typeof API_ERROR_REASON.invitation.email_already_linked;
    };

export class InviteArcherShell {
  private readonly sendInvitationEmail: SendInvitationEmail;

  constructor(
    private readonly persistence: InviteMemberPersistence,
    tokens: TokenRepository,
    jwt: JwtAuthService,
    mail: TransactionalMailPort,
    options: SendInvitationEmailOptions,
  ) {
    this.sendInvitationEmail = new SendInvitationEmail(
      tokens,
      jwt,
      mail,
      options,
    );
  }

  public invite = async (input: {
    archerId: string;
    email: string;
    publicName: string;
  }): Promise<InviteArcherShellResult> => {
    const email = input.email.trim().toLowerCase();
    const publicName = input.publicName.trim();
    const archerId = input.archerId.trim();
    if (!email || !publicName || !archerId) {
      return { ok: false, reason: API_ERROR_REASON.common.invalid_request };
    }

    const bound = await this.persistence.bindInvitedMemberToArcher({
      archerId,
      email,
      name: publicName,
    });

    if (!bound.ok) {
      return { ok: false, reason: bound.reason };
    }

    const sent = await this.sendInvitationEmail.send({
      user: bound.user,
      resent: bound.resent,
    });
    return { ok: true, ...sent };
  };
}
