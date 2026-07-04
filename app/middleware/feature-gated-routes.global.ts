import {
  defaultFeatureFlags,
  type FeatureFlags,
} from "~~/shared/website/feature-flags.schema";
import {
  isFeatureGatedRouteAllowed,
  resolveFeatureFlagForPath,
} from "~~/shared/website/feature-gated-routes";
import { WEBSITE_CONFIG_PUBLIC_ENDPOINTS } from "~~/shared/website/website-config.keys";

export default defineNuxtRouteMiddleware(async (to) => {
  const flagKey = resolveFeatureFlagForPath(to.path);

  if (flagKey === null) {
    return;
  }

  const flagsState = useState<FeatureFlags>("feature-flags-gate", () => {
    return defaultFeatureFlags();
  });
  const flagsLoaded = useState("feature-flags-gate-loaded", () => {
    return false;
  });

  if (!flagsLoaded.value) {
    try {
      const response = await $fetch<{ settings: FeatureFlags }>(
        WEBSITE_CONFIG_PUBLIC_ENDPOINTS.featureFlags,
      );
      flagsState.value = response.settings;
    } catch {
      // Keep defaults (all flags false)
    }

    flagsLoaded.value = true;
  }

  if (!isFeatureGatedRouteAllowed(to.path, flagsState.value)) {
    return navigateTo("/");
  }
});
