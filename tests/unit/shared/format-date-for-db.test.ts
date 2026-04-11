import { describe, expect, it } from "vitest";
import { formatDateForDb } from "~~/shared/utils";

describe("formatDateForDb", () => {
  it("formats a Date as YYYY-MM-DD (UTC)", () => {
    expect(formatDateForDb(new Date("2026-06-01T00:00:00.000Z"))).toBe(
      "2026-06-01",
    );
  });

  it("parses an ISO string and formats as YYYY-MM-DD", () => {
    expect(formatDateForDb("2026-04-11T14:30:00.000Z")).toBe("2026-04-11");
  });

  it("throws on invalid input", () => {
    expect(() => formatDateForDb("not-a-date")).toThrow(RangeError);
  });
});
