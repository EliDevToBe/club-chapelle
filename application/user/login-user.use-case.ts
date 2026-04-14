import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";

export type LoginUserResult =
  | { ok: true; accessToken: string; refreshToken: string }
  | { ok: false };

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
      return { ok: false };
    }

    const row = await this.users.findByEmailWithPasswordHash(email);
    if (!row?.passwordHash) {
      return { ok: false };
    }

    const passwordOk = await this.passwords.verify(
      input.password,
      row.passwordHash,
    );
    if (!passwordOk) {
      return { ok: false };
    }

    if (!row.authenticated) {
      return { ok: false };
    }

    return {
      ok: true,
      accessToken: this.jwt.signAccess(row.id),
      refreshToken: this.jwt.signRefresh(row.id),
    };
  };
}
