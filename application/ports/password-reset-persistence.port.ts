/** Atomic password reset: persist hashed password + mark recovery token used. */

export type CompletePasswordResetInput = {
  authUserId: string;
  tokenValue: string;
  passwordHash: string;
};

export interface PasswordResetPersistence {
  /** Returns `true` when both updates succeeded in one transaction; `false` otherwise. */
  completeReset: (input: CompletePasswordResetInput) => Promise<boolean>;
}
