import { describe, expect, it } from "vitest";
import {
  createPaginatedListQuerySchema,
  normalisePaginatedListRawQuery,
} from "~~/shared/schemas/paginated-list-query.schema";

describe("normalisePaginatedListRawQuery", () => {
  it("normalises paginated list query keys from raw h3 query", () => {
    expect(
      normalisePaginatedListRawQuery({
        limit: "20",
        offset: "40",
        q: "  alice  ",
      }),
    ).toEqual({
      limit: 20,
      offset: 40,
      q: "alice",
    });
  });

  it("leaves offset undefined when omitted so Zod can apply the default", () => {
    expect(normalisePaginatedListRawQuery({ limit: "10" })).toEqual({
      limit: 10,
      offset: undefined,
      q: undefined,
    });
  });
});

describe("createPaginatedListQuerySchema", () => {
  const schema = createPaginatedListQuerySchema({ maxLimit: 100 });

  it("defaults offset to 0 when omitted", () => {
    expect(schema.parse({ limit: 20 })).toEqual({
      limit: 20,
      offset: 0,
      q: undefined,
    });
  });

  it("rejects limit above maxLimit", () => {
    expect(() => {
      schema.parse({ limit: 101, offset: 0 });
    }).toThrow();
  });
});
