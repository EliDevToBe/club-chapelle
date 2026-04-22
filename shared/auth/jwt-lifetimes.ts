/** Access JWT lifetime in seconds (20 minutes). */
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 20;

/** Refresh JWT lifetime in seconds (7 days). */
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** Forgot-password recovery JWT lifetime in seconds (1 hour). */
export const FORGOT_PASSWORD_TOKEN_MAX_AGE_SECONDS = 60 * 60;
