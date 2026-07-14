import { describe, expect, it } from "vitest";
import {
  asNonEmptyString,
  asNumber,
  asNumberOrZero,
  asStringOrEmpty,
  asTrimmedString,
  normaliseUrl,
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

describe("asNumber", () => {
  it("returns finite numbers unchanged", () => {
    expect(asNumber(42)).toBe(42);
    expect(asNumber(0)).toBe(0);
    expect(asNumber(-3.5)).toBe(-3.5);
  });

  it("returns null for non-numbers", () => {
    expect(asNumber(null)).toBeNull();
    expect(asNumber(undefined)).toBeNull();
    expect(asNumber("42")).toBeNull();
  });

  it("returns null for NaN", () => {
    expect(asNumber(Number.NaN)).toBeNull();
  });
});

describe("asNumberOrZero", () => {
  it("returns finite numbers unchanged", () => {
    expect(asNumberOrZero(42)).toBe(42);
    expect(asNumberOrZero(-3.5)).toBe(-3.5);
  });

  it("returns zero for invalid values", () => {
    expect(asNumberOrZero(null)).toBe(0);
    expect(asNumberOrZero(undefined)).toBe(0);
    expect(asNumberOrZero("42")).toBe(0);
    expect(asNumberOrZero(Number.NaN)).toBe(0);
  });
});

describe("normaliseUrl", () => {
  it("trims surrounding whitespace", () => {
    expect(normaliseUrl("  https://www.instagram.com/example  ")).toBe(
      "https://www.instagram.com/example",
    );
  });

  it("strips trailing slashes", () => {
    expect(normaliseUrl("https://www.facebook.com/example///")).toBe(
      "https://www.facebook.com/example",
    );
  });

  it("trims and strips trailing slashes together", () => {
    expect(normaliseUrl("  https://www.instagram.com/example/  ")).toBe(
      "https://www.instagram.com/example",
    );
  });
});
