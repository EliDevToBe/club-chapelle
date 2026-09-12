import { randomInt } from "node:crypto";

/**
 * Generate a 6-digit OTP for email change.
 * 1 leading zero at most.
 */
export const generateEmailChangeOtp = (): string => {
  return randomInt(10_000, 1_000_000).toString().padStart(6, "0");
};
