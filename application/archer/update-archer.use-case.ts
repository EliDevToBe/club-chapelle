import type {
  ArcherRepository,
  UpdateArcherInput,
} from "~~/application/ports/archer-repository.port";
import type { ArcherId } from "~~/domain/archer/archer";

export class UpdateArcher {
  constructor(private readonly archers: ArcherRepository) {}

  public update = async (id: ArcherId, input: UpdateArcherInput) =>
    this.archers.update(id, input);
}
