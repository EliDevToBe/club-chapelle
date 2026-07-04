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

export type FindArchersPageInput = {
  limit: number;
  offset: number;
  search?: string;
  includeOffboarded?: boolean;
};

export type FindArchersPageResult = {
  items: Archer[];
  total: number;
};

export interface ArcherRepository {
  create: (input: CreateArcherInput) => Promise<Archer>;
  findById: (id: ArcherId) => Promise<Archer | null>;
  findMany: () => Promise<Archer[]>;
  findPage: (input: FindArchersPageInput) => Promise<FindArchersPageResult>;
  update: (id: ArcherId, input: UpdateArcherInput) => Promise<Archer | null>;
  delete: (id: ArcherId) => Promise<boolean>;
}
