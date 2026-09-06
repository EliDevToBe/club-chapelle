import { describe, expect, it } from "vitest";
import {
  API_ERROR_REASON,
  API_ERROR_STATUS,
  isApiErrorReason,
} from "~~/shared/api-error-reasons";

describe("API_ERROR_REASON registry", () => {
  it("keeps all wire reason values globally unique", () => {
    const values = Object.values(API_ERROR_REASON).flatMap((category) => {
      return Object.values(category);
    });

    expect(new Set(values).size).toBe(values.length);
  });

  it("assigns an HTTP status to every reason", () => {
    const values = Object.values(API_ERROR_REASON).flatMap((category) => {
      return Object.values(category);
    });

    for (const reason of values) {
      expect(API_ERROR_STATUS[reason]).toEqual(expect.any(Number));
    }
  });

  it("recognises registered reasons at runtime", () => {
    expect(isApiErrorReason(API_ERROR_REASON.user.self_revoke)).toBe(true);
    expect(isApiErrorReason("not_a_real_reason")).toBe(false);
    expect(isApiErrorReason(undefined)).toBe(false);
  });
});
