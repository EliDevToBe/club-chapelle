import { describe, expect, it } from "vitest";
import {
  firstQueryString,
  optionalIntQueryParam,
  trimmedOptionalQueryString,
} from "~~/shared/utils/query-params";

describe("firstQueryString", () => {
  it("returns undefined for nullish values", () => {
    expect(firstQueryString(undefined)).toBeUndefined();
    expect(firstQueryString(null)).toBeUndefined();
  });

  it("uses the first array entry", () => {
    expect(firstQueryString(["25", "30"])).toBe("25");
  });

  it("stringifies scalar values", () => {
    expect(firstQueryString(42)).toBe("42");
  });
});

describe("optionalIntQueryParam", () => {
  it("returns undefined for missing or empty values", () => {
    expect(optionalIntQueryParam(undefined)).toBeUndefined();
    expect(optionalIntQueryParam("")).toBeUndefined();
  });

  it("parses integer strings", () => {
    expect(optionalIntQueryParam("20")).toBe(20);
  });

  it("returns NaN for invalid integers", () => {
    expect(optionalIntQueryParam("abc")).toBeNaN();
  });
});

describe("trimmedOptionalQueryString", () => {
  it("trims and returns undefined for blank values", () => {
    expect(trimmedOptionalQueryString("  alice  ")).toBe("alice");
    expect(trimmedOptionalQueryString("   ")).toBeUndefined();
  });
});
