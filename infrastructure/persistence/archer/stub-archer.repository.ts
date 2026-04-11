import type { ArcherRepository } from "~~/application/ports/archer-repository.port";
import type { ArcherId } from "~~/domain/archer/archer";

export class StubArcherRepository implements ArcherRepository {
  findById = async (_id: ArcherId) => null;
}
