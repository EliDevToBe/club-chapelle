import { describe, expect, it } from "vitest";
import {
  highestRoleRank,
  sortRolesByOrder,
  userHasRoleAccess,
} from "~~/domain/user/role";

describe("sortRolesByOrder", () => {
  it("dedupes and orders by ROLE_ORDER", () => {
    expect(sortRolesByOrder(["admin", "member", "member"])).toEqual([
      "member",
      "admin",
    ]);
  });
});

describe("highestRoleRank", () => {
  it("returns -1 for an empty list", () => {
    expect(highestRoleRank([])).toBe(-1);
  });

  it("returns the highest ROLE_ORDER index", () => {
    expect(highestRoleRank(["member", "admin"])).toBe(2);
    expect(highestRoleRank(["developer"])).toBe(3);
  });
});

describe("userHasRoleAccess", () => {
  it("allows developer regardless of allowedRoles", () => {
    expect(userHasRoleAccess(["developer"], ["member"])).toBe(true);
  });

  it("allows when any user role is listed", () => {
    expect(userHasRoleAccess(["member", "manager"], ["manager"])).toBe(true);
  });

  it("denies when no user role matches and not developer", () => {
    expect(userHasRoleAccess(["member"], ["admin"])).toBe(false);
  });
});
