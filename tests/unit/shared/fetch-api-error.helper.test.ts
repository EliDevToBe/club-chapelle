import { describe, expect, it } from "vitest";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { readApiErrorReason } from "~~/shared/utils/read-api-error.helper";

describe("readApiErrorReason", () => {
  it("reads reason from nested ofetch error data", () => {
    const reason = readApiErrorReason({
      statusCode: 400,
      statusMessage: "Bad Request",
      data: {
        statusCode: 400,
        data: {
          reason: API_ERROR_REASON.user.self_revoke,
        },
      },
    });

    expect(reason).toBe(API_ERROR_REASON.user.self_revoke);
  });

  it("reads reason from a flatter data payload", () => {
    const reason = readApiErrorReason({
      data: {
        reason: API_ERROR_REASON.archer.linked,
      },
    });

    expect(reason).toBe(API_ERROR_REASON.archer.linked);
  });

  it("reads a top-level reason", () => {
    const reason = readApiErrorReason({
      reason: API_ERROR_REASON.common.not_found,
    });

    expect(reason).toBe(API_ERROR_REASON.common.not_found);
  });

  it("returns undefined when no reason is present", () => {
    const reason = readApiErrorReason({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });

    expect(reason).toBeUndefined();
  });

  it("returns undefined for unknown reason strings", () => {
    const reason = readApiErrorReason({
      data: {
        reason: "legacy_status_message",
      },
    });

    expect(reason).toBeUndefined();
  });
});
