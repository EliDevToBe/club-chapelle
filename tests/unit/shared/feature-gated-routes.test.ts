import { describe, expect, it } from "vitest";
import { defaultFeatureFlags } from "~~/shared/website/feature-flags.schema";
import {
  isFeatureGatedRouteAllowed,
  resolveFeatureFlagForPath,
} from "~~/shared/website/feature-gated-routes";

describe("resolveFeatureFlagForPath", () => {
  it("returns facebook_feed for /feed and nested paths", () => {
    expect(resolveFeatureFlagForPath("/feed")).toBe("facebook_feed");
    expect(resolveFeatureFlagForPath("/feed/archive")).toBe("facebook_feed");
  });

  it("returns competition_dashboard for /competitions and nested paths", () => {
    expect(resolveFeatureFlagForPath("/competitions")).toBe(
      "competition_dashboard",
    );
    expect(resolveFeatureFlagForPath("/competitions/123")).toBe(
      "competition_dashboard",
    );
  });

  it("returns null for ungated routes", () => {
    expect(resolveFeatureFlagForPath("/")).toBeNull();
    expect(resolveFeatureFlagForPath("/infos")).toBeNull();
    expect(resolveFeatureFlagForPath("/contact")).toBeNull();
  });
});

describe("isFeatureGatedRouteAllowed", () => {
  it("allows gated routes when the matching flag is true", () => {
    const flags = {
      ...defaultFeatureFlags(),
      facebook_feed: true,
      competition_dashboard: true,
    };

    expect(isFeatureGatedRouteAllowed("/feed", flags)).toBe(true);
    expect(isFeatureGatedRouteAllowed("/competitions", flags)).toBe(true);
  });

  it("denies gated routes when the matching flag is false", () => {
    const flags = defaultFeatureFlags();

    expect(isFeatureGatedRouteAllowed("/feed", flags)).toBe(false);
    expect(isFeatureGatedRouteAllowed("/competitions", flags)).toBe(false);
  });

  it("allows ungated routes regardless of flags", () => {
    const flags = defaultFeatureFlags();

    expect(isFeatureGatedRouteAllowed("/", flags)).toBe(true);
    expect(isFeatureGatedRouteAllowed("/infos", flags)).toBe(true);
  });
});
