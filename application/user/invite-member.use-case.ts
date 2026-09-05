import type { ArcherRepository } from "~~/application/ports/archer-repository.port";
import type { InviteMemberPersistence } from "~~/application/ports/invite-member-persistence.port";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import {
  SendInvitationEmail,
  type SendInvitationEmailOptions,
} from "~~/application/user/send-invitation-email";
import type { User } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export type InviteMemberOptions = SendInvitationEmailOptions;

export type InviteMemberResult =
  | { ok: true; user: User; mailSent: boolean; resent: boolean }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.invitation.account_already_active
        | typeof API_ERROR_REASON.invitation.account_already_invited
        | typeof API_ERROR_REASON.invitation.public_name_taken
        | typeof API_ERROR_REASON.common.invalid_request;
    };

export class InviteMember {
  private readonly sendInvitationEmail: SendInvitationEmail;

  constructor(
    private readonly users: UserRepository,
    private readonly archers: ArcherRepository,
    private readonly persistence: InviteMemberPersistence,
    tokens: TokenRepository,
    jwt: JwtAuthService,
    mail: TransactionalMailPort,
    options: InviteMemberOptions,
  ) {
    this.sendInvitationEmail = new SendInvitationEmail(
      tokens,
      jwt,
      mail,
      options,
    );
  }

  public invite = async (input: {
    name: string;
    email: string;
    allowResent?: boolean;
  }): Promise<InviteMemberResult> => {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    const allowResent = input.allowResent === true;
    if (!email || !name) {
      return { ok: false, reason: API_ERROR_REASON.common.invalid_request };
    }

    const existing = await this.users.findByEmailForPasswordReset(email);
    if (existing?.authenticated) {
      return {
        ok: false,
        reason: API_ERROR_REASON.invitation.account_already_active,
      };
    }

    let user: User;
    let resent = false;

    if (existing) {
      if (!allowResent) {
        return {
          ok: false,
          reason: API_ERROR_REASON.invitation.account_already_invited,
        };
      }
      const found = await this.users.findById(existing.id);
      if (!found) {
        return { ok: false, reason: API_ERROR_REASON.common.invalid_request };
      }
      user = found;
      resent = true;
    } else {
      const archerWithName = await this.archers.findByPublicName(name);
      if (archerWithName) {
        return {
          ok: false,
          reason: API_ERROR_REASON.invitation.public_name_taken,
        };
      }

      const created = await this.persistence.createInvitedMember({
        name,
        email,
      });
      if (!created.ok) {
        if (
          created.reason === API_ERROR_REASON.invitation.email_already_linked
        ) {
          return this.inviteAfterEmailRace(email, allowResent);
        }
        return { ok: false, reason: created.reason };
      }
      user = created.user;
    }

    const sent = await this.sendInvitationEmail.send({ user, resent });
    return { ok: true, ...sent };
  };

  private inviteAfterEmailRace = async (
    email: string,
    allowResent: boolean,
  ): Promise<InviteMemberResult> => {
    const raced = await this.users.findByEmailForPasswordReset(email);
    if (raced?.authenticated) {
      return {
        ok: false,
        reason: API_ERROR_REASON.invitation.account_already_active,
      };
    }
    if (!raced) {
      return { ok: false, reason: API_ERROR_REASON.common.invalid_request };
    }
    if (!allowResent) {
      return {
        ok: false,
        reason: API_ERROR_REASON.invitation.account_already_invited,
      };
    }

    const found = await this.users.findById(raced.id);
    if (!found) {
      return { ok: false, reason: API_ERROR_REASON.common.invalid_request };
    }

    const sent = await this.sendInvitationEmail.send({
      user: found,
      resent: true,
    });
    return { ok: true, ...sent };
  };
}
