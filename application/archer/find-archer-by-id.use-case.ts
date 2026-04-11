import type { ArcherRepository } from "~~/application/ports/archer-repository.port";
import type { ArcherId } from "~~/domain/archer/archer";

export class FindArcherById {
  constructor(private readonly archers: ArcherRepository) {}

  public async findById(id: ArcherId) {
    return this.archers.findById(id);
  }
}
