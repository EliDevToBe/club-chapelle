export type CompetitionId = string;

export type Competition = {
  id: CompetitionId;
  fileId: string | null;
  name: string;
  startDate: Date;
  endDate: Date;
  place: string | null;
  /** Decimal string, e.g. from Prisma `Decimal`. */
  price: string;
  category: "indoor" | "outdoor";
  type: "olympic" | "beursault" | "field" | "nature" | "d3";
  isChampionship: boolean;
  seasonYear: number;
  createdAt: Date;
};
