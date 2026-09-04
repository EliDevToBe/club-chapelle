/** Issue and verify access vs refresh JWTs using separate HS256 secrets (no in-token access/refresh meaning). */
export interface JwtAuthService {
  signAccess: (userId: string) => string;
  signRefresh: (userId: string) => string;
  /**
   * Recovery link JWT: signed with the access secret but must not authenticate sessions
   * (`verifyAccess` rejects tokens carrying the forgot-password claim).
   */
  signForgotPasswordToken: (userId: string) => string;
  /**
   * Validates a recovery JWT (`forgot_password` claim). Returns user id (`sub`)
   * or `null` if invalid, expired, or not a forgot-password token.
   */
  verifyForgotPasswordToken: (token: string) => string | null;
  /**
   * Invitation link JWT: signed with the access secret but must not authenticate
   * sessions (`verifyAccess` rejects tokens carrying the invitation claim).
   */
  signInvitationToken: (userId: string) => string;
  /**
   * Validates an invitation JWT (`invitation` claim). Returns user id (`sub`)
   * or `null` if invalid, expired, or not an invitation token.
   */
  verifyInvitationToken: (token: string) => string | null;
  /** Returns user id (`sub`) or `null` if invalid or expired. */
  verifyAccess: (token: string) => string | null;
  /** Returns user id (`sub`) or `null` if invalid or expired. */
  verifyRefresh: (token: string) => string | null;
}
