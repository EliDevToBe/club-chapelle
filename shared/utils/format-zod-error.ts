import type { ZodError } from "zod";

export const formatZodValidationError = (
  error: ZodError,
  fallback = "Invalid request",
): string => {
  const issue = error.issues[0];
  if (!issue) {
    return fallback;
  }

  const path = issue.path.join(".");
  if (path === "") {
    return issue.message;
  }

  return `Invalid ${path}: ${issue.message}`;
};
