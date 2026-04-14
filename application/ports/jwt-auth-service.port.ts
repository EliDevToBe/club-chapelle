/** Issue and verify access vs refresh JWTs using separate HS256 secrets (no in-token access/refresh meaning). */
export interface JwtAuthService {
  signAccess: (userId: string) => string;
  signRefresh: (userId: string) => string;
  /** Returns user id (`sub`) or `null` if invalid or expired. */
  verifyAccess: (token: string) => string | null;
  /** Returns user id (`sub`) or `null` if invalid or expired. */
  verifyRefresh: (token: string) => string | null;
}
