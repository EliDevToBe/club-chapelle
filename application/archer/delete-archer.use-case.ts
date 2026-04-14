import type { ArcherRepository } from "~~/application/ports/archer-repository.port";
import type { ArcherId } from "~~/domain/archer/archer";

export class DeleteArcher {
  constructor(private readonly archers: ArcherRepository) {}

  public delete = async (id: ArcherId) => this.archers.delete(id);
}
