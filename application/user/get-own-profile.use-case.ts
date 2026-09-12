import type { ArcherRepository } from "~~/application/ports/archer-repository.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { UserId } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { parseChangeEmailTokenValue } from "~~/shared/auth/email-change";
import type { OwnProfileDto } from "~~/shared/user/own-profile.dto";

export type GetOwnProfileResult =
  | { ok: true; profile: OwnProfileDto }
  | { ok: false; reason: typeof API_ERROR_REASON.common.not_found };

export class GetOwnProfile {
  constructor(
    private readonly users: UserRepository,
    private readonly archers: ArcherRepository,
    private readonly tokens: TokenRepository,
  ) {}

  public get = async (userId: UserId): Promise<GetOwnProfileResult> => {
    const user = await this.users.findById(userId);
    if (!user) {
      return { ok: false, reason: API_ERROR_REASON.common.not_found };
    }

    const archer = await this.archers.findLinkedByAuthUserId(user.id);
    const pendingToken = await this.tokens.findUnusedByUserAndType(
      user.id,
      "change_email",
    );
    let pendingEmail: string | null = null;
    if (pendingToken && pendingToken.expiresAt > new Date()) {
      const payload = parseChangeEmailTokenValue(pendingToken.tokenValue);
      pendingEmail = payload?.new_email ?? null;
    }

    return {
      ok: true,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        public_name: archer?.publicName ?? null,
        roles: user.roles,
        pending_email: pendingEmail,
      },
    };
  };
}
