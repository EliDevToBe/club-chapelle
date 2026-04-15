import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type {
  CreateUserInput,
  UserRepository,
} from "~~/application/ports/user-repository.port";

export class CreateUser {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
  ) {}

  public create = async (input: CreateUserInput) => {
    if (input.password === undefined) {
      return this.users.create(input);
    }
    if (input.password === null) {
      return this.users.create({ ...input, password: null });
    }
    const passwordHash = await this.passwords.hash(input.password);
    return this.users.create({ ...input, password: passwordHash });
  };
}
