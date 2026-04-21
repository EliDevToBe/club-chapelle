import type { Archer, ArcherId } from "~~/domain/archer/archer";

export type CreateArcherInput = {
  publicName: string;
  authUserId?: string | null;
  offboardedAt?: Date | null;
};

export type UpdateArcherInput = {
  publicName?: string;
  authUserId?: string | null;
  offboardedAt?: Date | null;
};

export interface ArcherRepository {
  create: (input: CreateArcherInput) => Promise<Archer>;
  findById: (id: ArcherId) => Promise<Archer | null>;
  findMany: () => Promise<Archer[]>;
  update: (id: ArcherId, input: UpdateArcherInput) => Promise<Archer | null>;
  delete: (id: ArcherId) => Promise<boolean>;
}
