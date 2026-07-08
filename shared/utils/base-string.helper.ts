export const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return trimmed;
};

export const asTrimmedString = (value: unknown): string => {
  return asNonEmptyString(value) ?? "";
};

export const asStringOrEmpty = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value;
};

export const normaliseUrl = (value: string): string => {
  const trimmed = value.trim();
  // Remove one or more trailing slashes (e.g. profile URLs saved with a trailing `/`).
  return trimmed.replace(/\/+$/, "");
};
