import { describe, expect, it, vi } from "vitest";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { CreateUser } from "~~/application/user/create-user.use-case";

describe("CreateUser", () => {
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

    const repo: UserRepository = {
      create: vi.fn().mockResolvedValue(expectedUser),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn(),
      findByEmailForPasswordReset: vi.fn(),
      findForPasswordResetById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const passwords: PasswordHasher = {
      hash: vi.fn(async (p: string) => `hashed:${p}`),
      verify: vi.fn(),
    };

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

    const repo: UserRepository = {
      create: vi.fn().mockResolvedValue(expectedUser),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn(),
      findByEmailForPasswordReset: vi.fn(),
      findForPasswordResetById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const passwords: PasswordHasher = {
      hash: vi.fn(async (p: string) => `hashed:${p}`),
      verify: vi.fn(),
    };

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
