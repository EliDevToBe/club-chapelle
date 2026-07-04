import { describe, expect, it } from "vitest";
import { toCreateCompetitionInput } from "~~/server/mappers/competition.mapper";
import type { CompetitionCreateDto } from "~~/shared/competitions/competition.dto";

describe("toCreateCompetitionInput", () => {
  const baseDto: CompetitionCreateDto = {
    name: "Critérium indoor",
    start_date: "2025-09-15",
    end_date: "2025-09-15",
    place: "Nogent-sur-Marne",
    price: "18.00",
    category: "indoor",
    type: "olympic",
    is_championship: false,
  };

  it("should infer seasonYear from start_date", () => {
    const input = toCreateCompetitionInput(baseDto);
    expect(input.seasonYear).toBe(2026);
  });

  it("should map all fields from the create DTO", () => {
    const input = toCreateCompetitionInput(baseDto);
    expect(input.name).toBe("Critérium indoor");
    expect(input.category).toBe("indoor");
    expect(input.type).toBe("olympic");
    expect(input.isChampionship).toBe(false);
    expect(input.price).toBe("18.00");
  });
});
