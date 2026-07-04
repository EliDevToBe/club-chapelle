import type { FeatureFlagKey, FeatureFlags } from "~~/shared/website/feature-flags.schema";

export const FEATURE_GATED_ROUTE_PREFIXES = {
  "/feed": "facebook_feed",
  "/competitions": "competition_dashboard",
} as const satisfies Record<string, FeatureFlagKey>;

export const resolveFeatureFlagForPath = (path: string): FeatureFlagKey | null => {
  for (const [prefix, flagKey] of Object.entries(FEATURE_GATED_ROUTE_PREFIXES)) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return flagKey;
    }
  }

  return null;
};

export const isFeatureGatedRouteAllowed = (
  path: string,
  flags: FeatureFlags,
): boolean => {
  const flagKey = resolveFeatureFlagForPath(path);

  if (flagKey === null) {
    return true;
  }

  return flags[flagKey] ?? false;
};
