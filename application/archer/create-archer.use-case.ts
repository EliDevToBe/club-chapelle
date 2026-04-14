import type {
  ArcherRepository,
  CreateArcherInput,
} from "~~/application/ports/archer-repository.port";

export class CreateArcher {
  constructor(private readonly archers: ArcherRepository) {}

  public create = async (input: CreateArcherInput) =>
    this.archers.create(input);
}
