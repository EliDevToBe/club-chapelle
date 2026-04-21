import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { SessionUser } from "~~/shared/auth/session-user";

export type LoginUserResult =
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      session: SessionUser;
    }
  | { ok: false; reason: string };

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
      return { ok: false, reason: "Invalid email or password" };
    }

    const row = await this.users.findByEmailWithPasswordHash(email);
    if (!row?.passwordHash) {
      return { ok: false, reason: "Invalid email or password" };
    }

    const passwordOk = await this.passwords.verify(
      input.password,
      row.passwordHash,
    );
    if (!passwordOk) {
      return { ok: false, reason: "Invalid email or password" };
    }

    if (!row.authenticated) {
      return { ok: false, reason: "User is not authenticated" };
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
