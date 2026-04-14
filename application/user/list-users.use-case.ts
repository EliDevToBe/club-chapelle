import type { UserRepository } from "~~/application/ports/user-repository.port";

export class ListUsers {
  constructor(private readonly users: UserRepository) {}

  public findMany = async () => this.users.findMany();
}
