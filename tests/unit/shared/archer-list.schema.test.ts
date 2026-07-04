import { describe, expect, it } from "vitest";
import { ARCHER_LIST_MAX_LIMIT } from "~~/shared/archer/archer-list.dto";
import { archerListQuerySchema } from "~~/shared/archer/archer-list.schema";

describe("archerListQuerySchema", () => {
  it("accepts paginated query input", () => {
    const result = archerListQuerySchema.safeParse({
      limit: 20,
      offset: 0,
      search: "alice",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        limit: 20,
        offset: 0,
        search: "alice",
      });
    }
  });

  it("rejects limit above the configured max", () => {
    const result = archerListQuerySchema.safeParse({
      limit: ARCHER_LIST_MAX_LIMIT + 1,
      offset: 0,
    });

    expect(result.success).toBe(false);
  });
});
