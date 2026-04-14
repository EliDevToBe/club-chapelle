import type {
  UpdateUserInput,
  UserRepository,
} from "~~/application/ports/user-repository.port";
import type { UserId } from "~~/domain/user/user";

export class UpdateUser {
  constructor(private readonly users: UserRepository) {}

  public update = async (id: UserId, input: UpdateUserInput) =>
    this.users.update(id, input);
}
