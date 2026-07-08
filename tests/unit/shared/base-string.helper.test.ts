import { describe, expect, it } from "vitest";
import {
  asNonEmptyString,
  asStringOrEmpty,
  asTrimmedString,
} from "~~/shared/utils/base-string.helper";

describe("asNonEmptyString", () => {
  it("returns trimmed string for non-empty values", () => {
    expect(asNonEmptyString("  hello  ")).toBe("hello");
  });

  it("returns null for non-strings", () => {
    expect(asNonEmptyString(null)).toBeNull();
    expect(asNonEmptyString(undefined)).toBeNull();
    expect(asNonEmptyString(42)).toBeNull();
  });

  it("returns null for blank strings", () => {
    expect(asNonEmptyString("")).toBeNull();
    expect(asNonEmptyString("   ")).toBeNull();
  });
});

describe("asTrimmedString", () => {
  it("returns trimmed string or empty string", () => {
    expect(asTrimmedString("  hello  ")).toBe("hello");
    expect(asTrimmedString(null)).toBe("");
    expect(asTrimmedString("   ")).toBe("");
  });
});

describe("asStringOrEmpty", () => {
  it("returns string values unchanged", () => {
    expect(asStringOrEmpty("  hello  ")).toBe("  hello  ");
  });

  it("returns empty string for non-strings", () => {
    expect(asStringOrEmpty(null)).toBe("");
    expect(asStringOrEmpty(undefined)).toBe("");
  });
});
