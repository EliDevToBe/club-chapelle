import type { Archer, ArcherId } from "~~/domain/archer/archer";

export interface ArcherRepository {
  findById: (id: ArcherId) => Promise<Archer | null>;
}
