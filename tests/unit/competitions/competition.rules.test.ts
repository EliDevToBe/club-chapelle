import { describe, expect, it } from "vitest";
import { allowedCompetitionTypesForCategory } from "~~/domain/competitions/competition.rules";

describe("allowedCompetitionTypesForCategory", () => {
  it("should allow only olympic and d3 for indoor", () => {
    expect(allowedCompetitionTypesForCategory("indoor")).toEqual([
      "olympic",
      "d3",
    ]);
  });

  it("should allow all five types for outdoor", () => {
    expect(allowedCompetitionTypesForCategory("outdoor")).toEqual([
      "olympic",
      "beursault",
      "field",
      "nature",
      "d3",
    ]);
  });
});
