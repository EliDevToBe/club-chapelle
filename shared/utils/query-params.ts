export const firstQueryString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (Array.isArray(value)) {
    const head = value[0];
    if (head === undefined || head === null) {
      return undefined;
    }
    return String(head);
  }
  return String(value);
};

export const optionalIntQueryParam = (value: unknown): number | undefined => {
  const raw = firstQueryString(value);
  if (raw === undefined || raw === "") {
    return undefined;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    return Number.NaN;
  }

  return parsed;
};

export const trimmedOptionalQueryString = (
  value: unknown,
): string | undefined => {
  const raw = firstQueryString(value)?.trim();
  if (raw === undefined || raw === "") {
    return undefined;
  }
  return raw;
};

export const optionalBooleanQueryParam = (
  value: unknown,
): boolean | undefined => {
  const raw = firstQueryString(value)?.trim().toLowerCase();
  if (raw === undefined || raw === "") {
    return undefined;
  }
  if (raw === "true" || raw === "1") {
    return true;
  }
  if (raw === "false" || raw === "0") {
    return false;
  }
  return undefined;
};
