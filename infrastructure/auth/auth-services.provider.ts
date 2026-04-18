import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import { Argon2PasswordHasher } from "~~/infrastructure/auth/argon2-password-hasher";
import { JsonWebTokenAuthService } from "~~/infrastructure/auth/jsonwebtoken-auth.service";

export type AuthServices = {
  jwt: JwtAuthService;
  password: PasswordHasher;
};

let authServices: AuthServices | null = null;

export const createAuthServices = (options: {
  accessSecret: string;
  refreshSecret: string;
}): AuthServices => {
  if (authServices) {
    return authServices;
  }

  authServices = {
    jwt: new JsonWebTokenAuthService(
      options.accessSecret,
      options.refreshSecret,
    ),
    password: new Argon2PasswordHasher(),
  };
  return authServices;
};
