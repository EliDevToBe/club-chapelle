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
  it("denies developer when developer is not listed in allowedRoles", () => {
    expect(userHasRoleAccess(["developer"], ["member"])).toBe(false);
  });

  it("allows when any user role is listed", () => {
    expect(userHasRoleAccess(["member", "manager"], ["manager"])).toBe(true);
  });

  it("allows developer when admin is listed and user also has admin", () => {
    expect(userHasRoleAccess(["developer", "admin"], ["admin"])).toBe(true);
  });

  it("denies when no user role matches", () => {
    expect(userHasRoleAccess(["member"], ["admin"])).toBe(false);
  });
});
