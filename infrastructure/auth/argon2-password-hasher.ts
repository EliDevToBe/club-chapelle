import argon2 from "argon2";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";

export class Argon2PasswordHasher implements PasswordHasher {
  public hash = async (plainPassword: string): Promise<string> => {
    return argon2.hash(plainPassword, {
      secret: Buffer.from(process.env.AUTH_PASSWORD_SECRET ?? ""),
    });
  };

  public verify = async (
    plainPassword: string,
    passwordHash: string,
  ): Promise<boolean> => {
    try {
      return await argon2.verify(passwordHash, plainPassword, {
        secret: Buffer.from(process.env.AUTH_PASSWORD_SECRET ?? ""),
      });
    } catch {
      return false;
    }
  };
}
