import {
  type ApiErrorReason,
  isApiErrorReason,
} from "~~/shared/api-error-reasons";
import { asNonEmptyString } from "~~/shared/utils/base-string.helper";

/**
 * Reads a Nitro `createError` `data.reason` code from an ofetch / $fetch
 * failure. ofetch puts the response body on `error.data`, so the payload
 * may be nested as `error.data.data.reason`.
 */
export const readApiErrorReason = (
  error: unknown,
): ApiErrorReason | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const record = error as Record<string, unknown>;
  const fromRecord = asNonEmptyString(record.reason);
  if (fromRecord !== null && isApiErrorReason(fromRecord)) {
    return fromRecord;
  }

  const data = record.data;
  if (typeof data !== "object" || data === null) {
    return undefined;
  }

  const dataRecord = data as Record<string, unknown>;
  const fromData = asNonEmptyString(dataRecord.reason);
  if (fromData !== null && isApiErrorReason(fromData)) {
    return fromData;
  }

  const nestedData = dataRecord.data;
  if (typeof nestedData !== "object" || nestedData === null) {
    return undefined;
  }

  const nestedRecord = nestedData as Record<string, unknown>;
  const fromNested = asNonEmptyString(nestedRecord.reason);
  if (fromNested !== null && isApiErrorReason(fromNested)) {
    return fromNested;
  }

  return undefined;
};
