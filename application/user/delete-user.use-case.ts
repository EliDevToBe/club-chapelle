import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { UserId } from "~~/domain/user/user";

export class DeleteUser {
  constructor(private readonly users: UserRepository) {}

  public delete = async (id: UserId) => this.users.delete(id);
}
