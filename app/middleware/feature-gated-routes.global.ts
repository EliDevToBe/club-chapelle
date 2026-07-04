import {
  syncFeatureFlagsGate,
  useFeatureFlagsGate,
} from "~/composables/useFeatureFlagsGate";
import { defaultFeatureFlags } from "~~/shared/website/feature-flags.schema";
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

  const { flags, loaded } = useFeatureFlagsGate();

  if (!loaded.value) {
    try {
      const response = await $fetch<{ settings: typeof flags.value }>(
        WEBSITE_CONFIG_PUBLIC_ENDPOINTS.featureFlags,
      );
      syncFeatureFlagsGate(response.settings);
    } catch {
      syncFeatureFlagsGate(defaultFeatureFlags());
    }
  }

  if (!isFeatureGatedRouteAllowed(to.path, flags.value)) {
    return navigateTo("/");
  }
});
