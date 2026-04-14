import type { ArcherRepository } from "~~/application/ports/archer-repository.port";

export class ListArchers {
  constructor(private readonly archers: ArcherRepository) {}

  public findMany = async () => this.archers.findMany();
}
