import { describe, expect, it } from "vitest";
import {
  formatDateForDbOrNull,
  parseDbDateString,
  parseDbDateStringOrNull,
} from "~~/shared/utils/dates";

describe("parseDbDateString", () => {
  it("returns a valid Date for an ISO string", () => {
    const d = parseDbDateString("2026-06-01T00:00:00.000Z");
    expect(d.getTime()).not.toBeNaN();
  });

  it("throws on invalid input", () => {
    expect(() => parseDbDateString("not-a-date")).toThrow(RangeError);
  });
});

describe("parseDbDateStringOrNull", () => {
  it("returns null for null, undefined, or empty string", () => {
    expect(parseDbDateStringOrNull(null)).toBeNull();
    expect(parseDbDateStringOrNull(undefined)).toBeNull();
    expect(parseDbDateStringOrNull("")).toBeNull();
  });

  it("parses a valid string", () => {
    const d = parseDbDateStringOrNull("2026-04-11T14:30:00.000Z");
    expect(d).not.toBeNull();
    expect(d?.getTime()).not.toBeNaN();
  });

  it("throws on invalid non-empty string", () => {
    expect(() => parseDbDateStringOrNull("bad")).toThrow(RangeError);
  });
});

describe("formatDateForDbOrNull", () => {
  it("returns null for null Date", () => {
    expect(formatDateForDbOrNull(null)).toBeNull();
  });

  it("formats a Date like formatDateForDb", () => {
    expect(formatDateForDbOrNull(new Date("2026-06-01T00:00:00.000Z"))).toBe(
      "2026-06-01",
    );
  });
});
