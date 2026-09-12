/** E-mail-change OTP lifetime in seconds (15 minutes). */
export const CHANGE_EMAIL_OTP_MAX_AGE_SECONDS = 60 * 15;

/** Minimum delay between OTP resends in seconds. */
export const CHANGE_EMAIL_RESEND_COOLDOWN_SECONDS = 30;

/** Failed OTP submissions before the pending change is revoked. */
export const CHANGE_EMAIL_MAX_FAILED_ATTEMPTS = 5;

export type ChangeEmailTokenPayload = {
  new_email: string;
  otp_hash: string;
  failed_attempts: number;
};

export const parseChangeEmailTokenValue = (
  value: string,
): ChangeEmailTokenPayload | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  if (typeof record.new_email !== "string" || record.new_email.length === 0) {
    return null;
  }
  if (typeof record.otp_hash !== "string" || record.otp_hash.length === 0) {
    return null;
  }
  if (
    typeof record.failed_attempts !== "number" ||
    !Number.isInteger(record.failed_attempts)
  ) {
    return null;
  }

  return {
    new_email: record.new_email,
    otp_hash: record.otp_hash,
    failed_attempts: record.failed_attempts,
  };
};
