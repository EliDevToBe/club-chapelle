import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type {
  UpdateUserInput,
  UserRepository,
} from "~~/application/ports/user-repository.port";
import type { UserId } from "~~/domain/user/user";

export class UpdateUser {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
  ) {}

  public update = async (id: UserId, input: UpdateUserInput) => {
    if (input.password === undefined) {
      return this.users.update(id, input);
    }
    if (input.password === null) {
      return this.users.update(id, { ...input, password: null });
    }
    const passwordHash = await this.passwords.hash(input.password);
    return this.users.update(id, { ...input, password: passwordHash });
  };
}
