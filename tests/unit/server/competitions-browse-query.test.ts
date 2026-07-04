import { describe, expect, it } from "vitest";
import { parseCompetitionsListingRawQuery } from "~~/server/utils/competitions-listing-query";

describe("parseCompetitionsListingRawQuery", () => {
  it("parses empty query as unbounded dates and no mine", () => {
    expect(parseCompetitionsListingRawQuery({})).toEqual({
      dateStartYmd: null,
      dateEndYmd: null,
      search: null,
      onlyMine: false,
    });
  });

  it("parses start_date and end_date", () => {
    expect(
      parseCompetitionsListingRawQuery({
        start: "2026-01-10",
        end: "2026-03-01",
      }),
    ).toEqual({
      dateStartYmd: "2026-01-10",
      dateEndYmd: "2026-03-01",
      search: null,
      onlyMine: false,
    });
  });

  it("parses mine=true only", () => {
    expect(parseCompetitionsListingRawQuery({ mine: "true" })).toEqual({
      dateStartYmd: null,
      dateEndYmd: null,
      search: null,
      onlyMine: true,
    });
  });

  it("throws on invalid mine value", () => {
    expect(() => {
      parseCompetitionsListingRawQuery({ mine: "1" });
    }).toThrow();
    expect(() => {
      parseCompetitionsListingRawQuery({ mine: "false" });
    }).toThrow();
  });

  it("throws on malformed date", () => {
    expect(() => {
      parseCompetitionsListingRawQuery({ start: "01-10-2026" });
    }).toThrow();
  });

  it("parses search trimmed", () => {
    expect(
      parseCompetitionsListingRawQuery({ search: "  hello  " }),
    ).toMatchObject({
      search: "hello",
    });
  });
});
