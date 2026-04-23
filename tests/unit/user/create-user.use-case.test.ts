import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { CreateUser } from "~~/application/user/create-user.use-case";

describe("CreateUser", () => {
  let repo: UserRepository;
  let passwords: PasswordHasher;

  beforeEach(() => {
    repo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn(),
      findByEmailForPasswordReset: vi.fn(),
      findForPasswordResetById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    passwords = {
      hash: vi.fn(async (p: string) => `hashed:${p}`),
      verify: vi.fn(),
    };
  });

  it("delegates user creation to repository", async () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const expectedUser = {
      id: "u1",
      email: "hello@example.com",
      name: null as string | null,
      roles: ["member"] as const,
      authenticated: false,
      createdAt,
    };

    repo.create = vi.fn().mockResolvedValue(expectedUser);

    const useCase = new CreateUser(repo, passwords);
    await expect(
      useCase.create({
        email: "hello@example.com",
        roles: ["member"],
      }),
    ).resolves.toEqual(expectedUser);

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({
      email: "hello@example.com",
      roles: ["member"],
    });
    expect(passwords.hash).not.toHaveBeenCalled();
  });

  it("hashes plaintext passwords before persisting", async () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const expectedUser = {
      id: "u2",
      email: "pw@example.com",
      name: null as string | null,
      roles: ["member"] as const,
      authenticated: true,
      createdAt,
    };

    repo.create = vi.fn().mockResolvedValue(expectedUser);

    const useCase = new CreateUser(repo, passwords);
    await useCase.create({
      email: "pw@example.com",
      roles: ["member"],
      authenticated: true,
      password: "plain",
    });

    expect(passwords.hash).toHaveBeenCalledWith("plain");
    expect(repo.create).toHaveBeenCalledWith({
      email: "pw@example.com",
      roles: ["member"],
      authenticated: true,
      password: "hashed:plain",
    });
  });
});
