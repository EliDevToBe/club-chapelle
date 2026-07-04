import {
  defaultFeatureFlags,
  type FeatureFlags,
} from "~~/shared/website/feature-flags.schema";

export const FEATURE_FLAGS_GATE_STATE_KEYS = {
  flags: "feature-flags-gate",
  loaded: "feature-flags-gate-loaded",
} as const;

export const useFeatureFlagsGate = () => {
  const flags = useState<FeatureFlags>(
    FEATURE_FLAGS_GATE_STATE_KEYS.flags,
    () => {
      return defaultFeatureFlags();
    },
  );
  const loaded = useState<boolean>(FEATURE_FLAGS_GATE_STATE_KEYS.loaded, () => {
    return false;
  });

  return {
    flags,
    loaded,
  };
};

export const syncFeatureFlagsGate = (settings: FeatureFlags): void => {
  const { flags, loaded } = useFeatureFlagsGate();
  flags.value = settings;
  loaded.value = true;
};
