import type {
  RevokeMemberAccessPersistence,
  RevokeMemberAccessResult,
} from "~~/application/ports/revoke-member-access-persistence.port";
import type { UserId } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export class RevokeMemberAccess {
  constructor(private readonly persistence: RevokeMemberAccessPersistence) {}

  public revoke = async (input: {
    targetUserId: UserId;
    actorUserId: UserId;
  }): Promise<RevokeMemberAccessResult> => {
    if (input.targetUserId === input.actorUserId) {
      return { ok: false, reason: API_ERROR_REASON.user.self_revoke };
    }

    const revoked = await this.persistence.revokeAccess(input.targetUserId);
    if (!revoked) {
      return { ok: false, reason: API_ERROR_REASON.common.not_found };
    }

    return { ok: true };
  };
}
