import { createError } from "h3";
import {
  API_ERROR_STATUS,
  type ApiErrorReason,
} from "~~/shared/api-error-reasons";

/** Builds an H3 error payload; always use with `throw`. */
export const ApiError = (reason: ApiErrorReason) => {
  return createError({
    statusCode: API_ERROR_STATUS[reason],
    data: { reason },
  });
};
