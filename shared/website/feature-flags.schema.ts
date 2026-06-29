import { z } from "zod";

export type FeatureFlagDefinition = {
  label: string;
  description?: string;
};

/**
 * Code-defined flags: keys drive the admin toggles and Zod schema
 * Label/description are UI-only.
 *
 * This is the entry point for the feature flags.
 */
export const FEATURE_FLAG_REGISTRY = {
  competition_dashboard: {
    label: "Dashboard des compétitions",
    description: "Afficher le dashboard de compétitions",
  },
} as const satisfies Readonly<Record<string, FeatureFlagDefinition>>;

export type FeatureFlagKey = keyof typeof FEATURE_FLAG_REGISTRY;

const buildFeatureFlagsSchema = (
  registry: Readonly<Record<string, FeatureFlagDefinition>>,
) => {
  const shape: Record<string, z.ZodDefault<z.ZodBoolean>> = {};

  for (const key of Object.keys(registry)) {
    shape[key] = z.boolean().default(false);
  }

  return z.object(shape);
};

export const createFeatureFlagHelpers = (
  registry: Readonly<Record<string, FeatureFlagDefinition>>,
) => {
  const schema = buildFeatureFlagsSchema(registry);

  const defaultFeatureFlags = () => {
    return schema.parse({});
  };

  const normaliseFeatureFlags = (raw: unknown) => {
    if (typeof raw !== "object" || raw === null) {
      return defaultFeatureFlags();
    }

    const payload: Record<string, unknown> = {};

    for (const key of Object.keys(registry)) {
      const value = (raw as Record<string, unknown>)[key];
      payload[key] = typeof value === "boolean" ? value : false;
    }

    return schema.parse(payload);
  };

  const keys = () => {
    return Object.keys(registry);
  };

  const hasFlags = () => {
    return keys().length > 0;
  };

  return {
    schema,
    defaultFeatureFlags,
    normaliseFeatureFlags,
    keys,
    hasFlags,
  };
};

const productionFeatureFlags = createFeatureFlagHelpers(FEATURE_FLAG_REGISTRY);

export const featureFlagsSchema = productionFeatureFlags.schema;

export type FeatureFlags = z.infer<typeof featureFlagsSchema>;

export const defaultFeatureFlags = (): FeatureFlags => {
  return productionFeatureFlags.defaultFeatureFlags();
};

export const normaliseFeatureFlags = (raw: unknown): FeatureFlags => {
  return productionFeatureFlags.normaliseFeatureFlags(raw);
};

export const featureFlagKeys = (): FeatureFlagKey[] => {
  return productionFeatureFlags.keys() as FeatureFlagKey[];
};

export const hasFeatureFlags = (): boolean => {
  return productionFeatureFlags.hasFlags();
};
