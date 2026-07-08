import { describe, expect, it } from "vitest";
import { normaliseSocialUrl } from "~~/shared/website/normalise-social-url";

describe("normaliseSocialUrl", () => {
  it("trims surrounding whitespace", () => {
    expect(normaliseSocialUrl("  https://www.instagram.com/example  ")).toBe(
      "https://www.instagram.com/example",
    );
  });

  it("strips trailing slashes", () => {
    expect(normaliseSocialUrl("https://www.facebook.com/example///")).toBe(
      "https://www.facebook.com/example",
    );
  });

  it("trims and strips trailing slashes together", () => {
    expect(normaliseSocialUrl("  https://www.instagram.com/example/  ")).toBe(
      "https://www.instagram.com/example",
    );
  });
});
