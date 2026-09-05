/** Reads Nitro `createError` statusMessage from an ofetch / $fetch failure. */
export const readApiErrorStatusMessage = (
  error: unknown,
): string | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const record = error as Record<string, unknown>;
  const data = record.data;
  if (typeof data === "object" && data !== null) {
    const dataRecord = data as Record<string, unknown>;
    if (typeof dataRecord.statusMessage === "string") {
      return dataRecord.statusMessage;
    }
  }

  if (typeof record.statusMessage === "string") {
    return record.statusMessage;
  }

  return undefined;
};
