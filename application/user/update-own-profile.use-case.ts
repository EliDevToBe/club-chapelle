import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { User, UserId } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export type UpdateOwnProfileResult =
  | { ok: true; user: User }
  | { ok: false; reason: typeof API_ERROR_REASON.common.not_found };

export class UpdateOwnProfile {
  constructor(private readonly users: UserRepository) {}

  public update = async (input: {
    userId: UserId;
    name: string;
  }): Promise<UpdateOwnProfileResult> => {
    const updated = await this.users.update(input.userId, {
      name: input.name,
    });
    if (!updated) {
      return { ok: false, reason: API_ERROR_REASON.common.not_found };
    }

    return { ok: true, user: updated };
  };
}
