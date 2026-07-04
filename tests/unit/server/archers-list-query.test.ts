import { describe, expect, it } from "vitest";
import { parseArchersListRawQuery } from "~~/server/utils/archers-list-query";
import { ARCHER_LIST_MAX_LIMIT } from "~~/shared/archer/archer-list.dto";

describe("parseArchersListRawQuery", () => {
  it("parses empty query as legacy list mode with default offset", () => {
    expect(parseArchersListRawQuery({})).toEqual({
      limit: undefined,
      offset: 0,
      search: undefined,
    });
  });

  it("parses paginated query with search", () => {
    expect(
      parseArchersListRawQuery({
        limit: "20",
        offset: "40",
        search: "  alice  ",
      }),
    ).toEqual({
      limit: 20,
      offset: 40,
      search: "alice",
    });
  });

  it("defaults offset to 0 when omitted in paginated mode", () => {
    expect(parseArchersListRawQuery({ limit: "10" })).toEqual({
      limit: 10,
      offset: 0,
      search: undefined,
    });
  });

  it("throws on invalid limit", () => {
    expect(() => {
      parseArchersListRawQuery({ limit: "abc" });
    }).toThrow();
    expect(() => {
      parseArchersListRawQuery({ limit: "0" });
    }).toThrow();
    expect(() => {
      parseArchersListRawQuery({ limit: String(ARCHER_LIST_MAX_LIMIT + 1) });
    }).toThrow();
  });

  it("throws on negative offset", () => {
    expect(() => {
      parseArchersListRawQuery({ limit: "10", offset: "-1" });
    }).toThrow();
  });

  it("uses the first value when query params are repeated", () => {
    expect(
      parseArchersListRawQuery({
        limit: ["25", "30"],
        search: ["bob", "ignored"],
      }),
    ).toEqual({
      limit: 25,
      offset: 0,
      search: "bob",
    });
  });
});
