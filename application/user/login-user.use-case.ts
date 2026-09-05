import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { SessionUser } from "~~/shared/auth/session-user";

export type LoginUserResult =
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      session: SessionUser;
    }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.auth.invalid_credentials
        | typeof API_ERROR_REASON.auth.account_not_active;
    };

export class LoginUser {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
    private readonly jwt: JwtAuthService,
  ) {}

  public login = async (input: {
    email: string;
    password: string;
  }): Promise<LoginUserResult> => {
    const email = input.email.trim().toLowerCase();
    if (!email || !input.password) {
      return { ok: false, reason: API_ERROR_REASON.auth.invalid_credentials };
    }

    const row = await this.users.findByEmailWithPasswordHash(email);
    if (!row?.passwordHash) {
      return { ok: false, reason: API_ERROR_REASON.auth.invalid_credentials };
    }

    const passwordOk = await this.passwords.verify(
      input.password,
      row.passwordHash,
    );
    if (!passwordOk) {
      return { ok: false, reason: API_ERROR_REASON.auth.invalid_credentials };
    }

    if (!row.authenticated) {
      return { ok: false, reason: API_ERROR_REASON.auth.account_not_active };
    }

    return {
      ok: true,
      accessToken: this.jwt.signAccess(row.id),
      refreshToken: this.jwt.signRefresh(row.id),
      session: {
        id: row.id,
        name: row.name,
        roles: row.roles,
      },
    };
  };
}
