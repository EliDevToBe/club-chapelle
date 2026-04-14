import { describe, expect, it, vi } from "vitest";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { CreateUser } from "~~/application/user/create-user.use-case";

describe("CreateUser", () => {
  it("delegates user creation to repository", async () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const expectedUser = {
      id: "u1",
      email: "hello@example.com",
      role: "member" as const,
      authenticated: false,
      createdAt,
    };

    const repo: UserRepository = {
      create: vi.fn().mockResolvedValue(expectedUser),
      findById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreateUser(repo);
    await expect(
      useCase.create({
        email: "hello@example.com",
        role: "member",
      }),
    ).resolves.toEqual(expectedUser);

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({
      email: "hello@example.com",
      role: "member",
    });
  });
});
