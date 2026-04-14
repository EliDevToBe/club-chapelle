import { describe, expect, it } from "vitest";
import { seasonYearFromDate } from "~~/domain/utils";

describe("seasonYearFromDate", () => {
  it("should return 2024 for 31/08/2025", () => {
    expect(seasonYearFromDate(new Date("2025-08-31T00:00:00.000Z"))).toBe(2024);
  });

  it("should return 2025 for dates from 10/09/2025 to 31/12/2025", () => {
    expect(seasonYearFromDate(new Date("2025-09-01T00:00:00.000Z"))).toBe(2025);
    expect(seasonYearFromDate(new Date("2025-12-31T00:00:00.000Z"))).toBe(2025);
  });

  it("should return 2025 for dates from 01/01/2026 to 09/2026", () => {
    expect(seasonYearFromDate(new Date("2026-08-31T00:00:00.000Z"))).toBe(2025);
    expect(seasonYearFromDate(new Date("2026-01-15T00:00:00.000Z"))).toBe(2025);
  });
});
