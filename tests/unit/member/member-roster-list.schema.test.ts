import { describe, expect, it } from "vitest";
import { MEMBER_ROSTER_MAX_LIMIT } from "~~/shared/member/member-roster-list.dto";
import { memberRosterListQuerySchema } from "~~/shared/member/member-roster-list.schema";

describe("memberRosterListQuerySchema", () => {
  it("accepts paginated roster query input with filters", () => {
    const result = memberRosterListQuerySchema.safeParse({
      limit: 10,
      offset: 0,
      search: "robin",
      status: "active",
      role: "admin",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        limit: 10,
        offset: 0,
        search: "robin",
        status: "active",
        role: "admin",
      });
    }
  });

  it("requires limit", () => {
    const result = memberRosterListQuerySchema.safeParse({
      offset: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rejects limit above the configured max", () => {
    const result = memberRosterListQuerySchema.safeParse({
      limit: MEMBER_ROSTER_MAX_LIMIT + 1,
      offset: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid status values", () => {
    const result = memberRosterListQuerySchema.safeParse({
      limit: 10,
      offset: 0,
      status: "pending",
    });

    expect(result.success).toBe(false);
  });
});
