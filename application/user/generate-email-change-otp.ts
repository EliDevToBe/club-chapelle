import { randomInt } from "node:crypto";

export const generateEmailChangeOtp = (): string => {
  return randomInt(10_000, 1_000_000).toString().padStart(6, "0");
};
