import { describe, expect, it } from "vitest";
import { readApiErrorStatusMessage } from "~~/shared/utils/read-api-error.helper";

describe("readApiErrorStatusMessage", () => {
  it("reads statusMessage from nested fetch error data", () => {
    const message = readApiErrorStatusMessage({
      statusCode: 409,
      statusMessage: "Conflict",
      data: {
        statusMessage: "Archer is linked to an account",
      },
    });

    expect(message).toBe("Archer is linked to an account");
  });

  it("falls back to top-level statusMessage", () => {
    const message = readApiErrorStatusMessage({
      statusMessage: "Archer not found",
    });

    expect(message).toBe("Archer not found");
  });
});
