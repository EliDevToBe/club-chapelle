import type {
  CreateUserInput,
  UserRepository,
} from "~~/application/ports/user-repository.port";

export class CreateUser {
  constructor(private readonly users: UserRepository) {}

  public create = async (input: CreateUserInput) => this.users.create(input);
}
