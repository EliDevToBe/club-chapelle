import { z } from "zod";
import {
  asNonEmptyString,
  asTrimmedString,
} from "~~/shared/utils/base-string.helper";

export type TextSection = {
  title: string;
  subtitle: string;
  paragraphs: string[];
};

export const TEXT_SECTION_FIELD_KEYS = [
  "title",
  "subtitle",
  "paragraphs",
] as const satisfies ReadonlyArray<keyof TextSection>;

export const textSectionSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  subtitle: z.string(),
  paragraphs: z
    .array(z.string().min(1))
    .min(1, "Au moins un paragraphe est requis"),
});

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const prepareParagraphs = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((paragraph) => {
      return asTrimmedString(paragraph);
    })
    .filter((paragraph) => {
      return paragraph.length > 0;
    });
};

const prepareTextSectionRecord = (
  record: Record<string, unknown>,
): Record<string, unknown> => {
  return {
    title: asTrimmedString(record.title),
    subtitle: asTrimmedString(record.subtitle),
    paragraphs: prepareParagraphs(record.paragraphs),
  };
};

export const defaultTextSection = (seed: TextSection): TextSection => {
  return textSectionSchema.parse(prepareTextSectionRecord(seed));
};

export const cloneTextSection = (value: TextSection): TextSection => {
  return {
    title: value.title,
    subtitle: value.subtitle,
    paragraphs: [...value.paragraphs],
  };
};

export const normaliseTextSection = (
  raw: unknown,
  seed: TextSection,
): TextSection => {
  if (!isRecord(raw)) {
    return defaultTextSection(seed);
  }

  const preparedParagraphs = prepareParagraphs(raw.paragraphs);
  const merged: Record<string, unknown> = {
    title: asNonEmptyString(raw.title) ?? seed.title,
    subtitle:
      typeof raw.subtitle === "string"
        ? asTrimmedString(raw.subtitle)
        : seed.subtitle,
    paragraphs:
      Array.isArray(raw.paragraphs) && preparedParagraphs.length > 0
        ? preparedParagraphs
        : seed.paragraphs,
  };

  try {
    return textSectionSchema.parse(merged);
  } catch {
    return defaultTextSection(seed);
  }
};

export const parseTextSection = (raw: unknown): TextSection => {
  const record = isRecord(raw) ? raw : {};

  return textSectionSchema.parse(prepareTextSectionRecord(record));
};

export const hasTextSectionDocumentFields = (
  patch: Record<string, unknown>,
): boolean => {
  return TEXT_SECTION_FIELD_KEYS.every((key) => {
    return Object.hasOwn(patch, key);
  });
};
