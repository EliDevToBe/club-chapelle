import { describe, expect, it } from "vitest";
import { z } from "zod";
import { formatZodValidationError } from "~~/shared/utils/format-zod-error";

describe("formatZodValidationError", () => {
  it("formats the first issue with its field path", () => {
    const result = z.object({ limit: z.number().int().min(1) }).safeParse({
      limit: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodValidationError(result.error)).toBe(
        "Invalid limit: Too small: expected number to be >=1",
      );
    }
  });

  it("uses the fallback when there are no issues", () => {
    const error = new z.ZodError([]);
    expect(formatZodValidationError(error, "Invalid query")).toBe(
      "Invalid query",
    );
  });

  it("returns the message when the issue has no path", () => {
    const error = new z.ZodError([
      {
        code: "custom",
        message: "Something went wrong",
        path: [],
      },
    ]);

    expect(formatZodValidationError(error)).toBe("Something went wrong");
  });
});
