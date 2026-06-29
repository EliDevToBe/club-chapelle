import { describe, expect, it } from "vitest";
import {
  createFeatureFlagHelpers,
  defaultFeatureFlags,
  featureFlagKeys,
} from "~~/shared/website/feature-flags.schema";

describe("createFeatureFlagHelpers", () => {
  it("returns {} when the registry is empty", () => {
    const { defaultFeatureFlags, normaliseFeatureFlags } =
      createFeatureFlagHelpers({});

    expect(defaultFeatureFlags()).toEqual({});
    expect(normaliseFeatureFlags(null)).toEqual({});
    expect(normaliseFeatureFlags(undefined)).toEqual({});
    expect(normaliseFeatureFlags({ unknown_flag: true })).toEqual({});
  });

  it("strips unknown keys from stored settings", () => {
    const { normaliseFeatureFlags } = createFeatureFlagHelpers({
      alpha: { label: "Alpha" },
      beta: { label: "Beta" },
    });

    expect(
      normaliseFeatureFlags({
        alpha: true,
        unknown_flag: true,
        another_one: false,
      }),
    ).toEqual({ alpha: true, beta: false });
  });

  it("coerces non-boolean values to false for known keys", () => {
    const { normaliseFeatureFlags } = createFeatureFlagHelpers({
      alpha: { label: "Alpha" },
    });

    expect(normaliseFeatureFlags({ alpha: "yes" })).toEqual({ alpha: false });
  });

  it("preserves true booleans for known keys", () => {
    const { normaliseFeatureFlags } = createFeatureFlagHelpers({
      alpha: { label: "Alpha" },
    });

    expect(normaliseFeatureFlags({ alpha: true })).toEqual({ alpha: true });
  });

  it("reports whether the registry has flags", () => {
    expect(createFeatureFlagHelpers({}).hasFlags()).toBe(false);
    expect(
      createFeatureFlagHelpers({ alpha: { label: "Alpha" } }).hasFlags(),
    ).toBe(true);
  });
});

describe("production FEATURE_FLAG_REGISTRY", () => {
  it("defaults every registered key to false", () => {
    const flags = defaultFeatureFlags();

    for (const key of featureFlagKeys()) {
      expect(flags[key]).toBe(false);
    }

    expect(Object.keys(flags)).toEqual(featureFlagKeys());
  });
});
