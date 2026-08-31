import { z } from "zod";
import {
  asNonEmptyString,
  asStringOrEmpty,
  asTrimmedString,
} from "~~/shared/utils/base-string.helper";

export const TARIFS_CALLOUT_STYLES = [
  "plain",
  "highlight",
  "emphasis",
] as const;

export type TarifsCalloutStyle = (typeof TARIFS_CALLOUT_STYLES)[number];

export type TarifsItem = {
  id: string;
  label: string;
  amount: string;
};

export type TarifsCalloutSegment = {
  id: string;
  text: string;
  style: TarifsCalloutStyle;
  insert_contact_email: boolean;
};

export type Tarifs = {
  title: string;
  subtitle: string;
  intro: string;
  items: TarifsItem[];
  callout_segments: TarifsCalloutSegment[];
};

export const TARIFS_FIELD_KEYS = [
  "title",
  "subtitle",
  "intro",
  "items",
  "callout_segments",
] as const satisfies ReadonlyArray<keyof Tarifs>;

export const tarifsItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Le libellé du tarif est requis"),
  amount: z.string().min(1, "Le montant est requis"),
});

export const tarifsCalloutSegmentSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
  style: z.enum(TARIFS_CALLOUT_STYLES),
  insert_contact_email: z.boolean(),
});

export const tarifsSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  subtitle: z.string(),
  intro: z.string(),
  items: z.array(tarifsItemSchema),
  callout_segments: z.array(tarifsCalloutSegmentSchema),
});

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const asCalloutStyle = (value: unknown): TarifsCalloutStyle => {
  if (value === "highlight" || value === "emphasis" || value === "plain") {
    return value;
  }

  return "plain";
};

const prepareTarifsItem = (
  raw: unknown,
  index: number,
): Record<string, unknown> => {
  const record = isRecord(raw) ? raw : {};

  return {
    id: asNonEmptyString(record.id) ?? `tarifs-item-${index}`,
    label: asTrimmedString(record.label),
    amount: asTrimmedString(record.amount),
  };
};

const prepareCalloutSegment = (
  raw: unknown,
  index: number,
): Record<string, unknown> => {
  const record = isRecord(raw) ? raw : {};

  return {
    id: asNonEmptyString(record.id) ?? `tarifs-callout-${index}`,
    text: asStringOrEmpty(record.text),
    style: asCalloutStyle(record.style),
    insert_contact_email: record.insert_contact_email === true,
  };
};

const prepareTarifsRecord = (
  record: Record<string, unknown>,
): Record<string, unknown> => {
  const itemsRaw = record.items;
  const segmentsRaw = record.callout_segments;

  return {
    title: asTrimmedString(record.title),
    subtitle: asTrimmedString(record.subtitle),
    intro: asTrimmedString(record.intro),
    items: Array.isArray(itemsRaw)
      ? itemsRaw.map((item, index) => {
          return prepareTarifsItem(item, index);
        })
      : [],
    callout_segments: Array.isArray(segmentsRaw)
      ? segmentsRaw.map((segment, index) => {
          return prepareCalloutSegment(segment, index);
        })
      : [],
  };
};

export const defaultTarifs = (seed: Tarifs): Tarifs => {
  return tarifsSchema.parse(prepareTarifsRecord(seed));
};

export const cloneTarifs = (value: Tarifs): Tarifs => {
  return {
    title: value.title,
    subtitle: value.subtitle,
    intro: value.intro,
    items: value.items.map((item) => {
      return { ...item };
    }),
    callout_segments: value.callout_segments.map((segment) => {
      return { ...segment };
    }),
  };
};

export const isCalloutSegmentVisible = (
  segment: TarifsCalloutSegment,
): boolean => {
  if (segment.insert_contact_email) {
    return true;
  }

  return segment.text.length > 0;
};

export const normaliseTarifs = (raw: unknown, seed: Tarifs): Tarifs => {
  if (!isRecord(raw)) {
    return defaultTarifs(seed);
  }

  const itemsRaw = raw.items;
  const segmentsRaw = raw.callout_segments;
  const merged: Record<string, unknown> = {
    title: asNonEmptyString(raw.title) ?? seed.title,
    subtitle:
      typeof raw.subtitle === "string"
        ? asTrimmedString(raw.subtitle)
        : seed.subtitle,
    intro: asNonEmptyString(raw.intro) ?? seed.intro,
    items: Array.isArray(itemsRaw)
      ? itemsRaw.map((item, index) => {
          return prepareTarifsItem(item, index);
        })
      : seed.items,
    callout_segments: Array.isArray(segmentsRaw)
      ? segmentsRaw.map((segment, index) => {
          return prepareCalloutSegment(segment, index);
        })
      : seed.callout_segments,
  };

  try {
    return tarifsSchema.parse(merged);
  } catch {
    return defaultTarifs(seed);
  }
};

export const parseTarifs = (raw: unknown): Tarifs => {
  const record = isRecord(raw) ? raw : {};

  return tarifsSchema.parse(prepareTarifsRecord(record));
};

export const hasTarifsDocumentFields = (
  patch: Record<string, unknown>,
): boolean => {
  return TARIFS_FIELD_KEYS.every((key) => {
    return Object.hasOwn(patch, key);
  });
};
