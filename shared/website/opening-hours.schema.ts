import { z } from "zod";
import {
  asNonEmptyString,
  asTrimmedString,
} from "~~/shared/utils/base-string.helper";

export type OpeningHoursSlot = {
  id: string;
  label: string;
  time_range: string;
  audience: string;
  highlight: boolean;
  highlight_text: string;
};

export type OpeningHours = {
  title: string;
  subtitle: string;
  intro: string;
  slots: OpeningHoursSlot[];
  epilogue: string;
};

export const OPENING_HOURS_FIELD_KEYS = [
  "title",
  "subtitle",
  "intro",
  "slots",
  "epilogue",
] as const satisfies ReadonlyArray<keyof OpeningHours>;

export const openingHoursSlotSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Le jour du créneau est requis"),
  time_range: z.string().min(1, "Les horaires sont requis"),
  audience: z.string(),
  highlight: z.boolean(),
  highlight_text: z.string(),
});

export const openingHoursSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  subtitle: z.string(),
  intro: z.string(),
  slots: z.array(openingHoursSlotSchema),
  epilogue: z.string(),
});

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const prepareOpeningHoursSlot = (
  raw: unknown,
  index: number,
): Record<string, unknown> => {
  const record = isRecord(raw) ? raw : {};

  return {
    id: asNonEmptyString(record.id) ?? `opening-hours-slot-${index}`,
    label: asTrimmedString(record.label),
    time_range: asTrimmedString(record.time_range),
    audience: asTrimmedString(record.audience),
    highlight: record.highlight === true,
    highlight_text: asTrimmedString(record.highlight_text),
  };
};

const prepareOpeningHoursRecord = (
  record: Record<string, unknown>,
): Record<string, unknown> => {
  const slotsRaw = record.slots;

  return {
    title: asTrimmedString(record.title),
    subtitle: asTrimmedString(record.subtitle),
    intro: asTrimmedString(record.intro),
    epilogue: asTrimmedString(record.epilogue),
    slots: Array.isArray(slotsRaw)
      ? slotsRaw.map((slot, index) => {
          return prepareOpeningHoursSlot(slot, index);
        })
      : [],
  };
};

export const defaultOpeningHours = (seed: OpeningHours): OpeningHours => {
  return openingHoursSchema.parse(prepareOpeningHoursRecord(seed));
};

export const cloneOpeningHours = (value: OpeningHours): OpeningHours => {
  return {
    title: value.title,
    subtitle: value.subtitle,
    intro: value.intro,
    epilogue: value.epilogue,
    slots: value.slots.map((slot) => {
      return { ...slot };
    }),
  };
};

export const normaliseOpeningHours = (
  raw: unknown,
  seed: OpeningHours,
): OpeningHours => {
  if (!isRecord(raw)) {
    return defaultOpeningHours(seed);
  }

  const slotsRaw = raw.slots;
  const merged: Record<string, unknown> = {
    title: asNonEmptyString(raw.title) ?? seed.title,
    subtitle:
      typeof raw.subtitle === "string"
        ? asTrimmedString(raw.subtitle)
        : seed.subtitle,
    intro: asNonEmptyString(raw.intro) ?? seed.intro,
    epilogue: asNonEmptyString(raw.epilogue) ?? seed.epilogue,
    slots: Array.isArray(slotsRaw)
      ? slotsRaw.map((slot, index) => {
          return prepareOpeningHoursSlot(slot, index);
        })
      : seed.slots,
  };

  try {
    return openingHoursSchema.parse(merged);
  } catch {
    return defaultOpeningHours(seed);
  }
};

export const parseOpeningHours = (raw: unknown): OpeningHours => {
  const record = isRecord(raw) ? raw : {};

  return openingHoursSchema.parse(prepareOpeningHoursRecord(record));
};

export const hasOpeningHoursDocumentFields = (
  patch: Record<string, unknown>,
): boolean => {
  return OPENING_HOURS_FIELD_KEYS.every((key) => {
    return Object.hasOwn(patch, key);
  });
};
