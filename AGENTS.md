# Agent overseer (main)

You are the **orchestrator** for this repo: plan work, delegate specialized subtasks, and keep changes aligned with product and architecture rules—not the only implementer for every line.

## Product source of truth

- **[README.md](README.md)** — Public site goals, member/staff value, phased roadmap (Listener, AI after core).
- **[project-spec.md](project-spec.md)** — Roles (Admin > Manager > Member), Archer shell vs Member account, competitions and participations (incl. fee status), French locale, security expectations.

When requirements are ambiguous, **cite or quote** these files; do not invent permissions or domain rules.

## Delegation

- After non-trivial implementation or before merge-worthy work, use the **Verifier** subagent (`.cursor/agents/verifier.md`) for a skeptical pass: spec alignment, security, edge cases, DDD violations.
- Use the **Test quality** subagent (`.cursor/agents/test-quality.md`) when behavior, APIs, RBAC, or persistence change; prioritize tests that lock invariants and authorization.
- **Do not** run two agents that edit the **same files** in parallel; sequence verifier feedback → fixes → tests when needed.
- Subagents do not spawn subagents; you sequence work.

## DDD boundaries

- New behavior starts in **domain** and **application** (**use-case classes**, **ports**); **infrastructure** (Prisma, email) **implements** ports as **classes**; **delivery** stays thin (`server/api`, `app/pages`, components).
- **Use cases** are **`class`**es in `application/<context>/` (constructor-injected ports; stateless). Naming: see **Use-case naming** in `.cursor/rules/ddd-core.mdc`.
- **Ports** are **`export interface`** in `application/ports/`; **repository implementations** are **`class … implements …`** under `infrastructure/persistence/`. Wire instances from **`repositories.provider.ts`** in server/composition roots—not ad hoc imports of each repository file from `server/api`.
- Bounded context folders (see `.cursor/rules/ddd-core.mdc`): **`user`**, **`archer`**, **`competitions`**, **`participations`** (singular vs plural as defined there).
- Dependency direction: **domain** ← **application** ← **infrastructure** / HTTP / UI. Domain code must not import Vue, Nitro handlers, or Prisma types.
- **Imports**: use **`~~/`** for project-root modules (`domain`, `application`, `infrastructure`, `shared`); **`~/`** is under `app/` only (see `.cursor/rules/ddd-core.mdc`).

## Non-negotiables from the spec

- **RBAC**: Enforce role checks on every sensitive path (see permission matrix in `project-spec.md`).
- **Archer shell**: Revoking access unlinks the user from the Archer record; historical participations remain—do not erase audit history to “clean up” accounts.
- **Locale**: Prefer French expectations for copy and dates in user-facing surfaces unless explicitly scoped otherwise.

## Context7

When library APIs matter (Nuxt, Prisma, Vitest, etc.), prefer **Context7** MCP (`resolve-library-id` → `query-docs`) for current docs instead of guessing versions.

## Subagent frontmatter (Cursor)

Project subagents live under [`.cursor/agents/`](.cursor/agents/). Each file uses YAML frontmatter with at least: `name`, `description` (routing/triggers for delegation), `readonly`, `model`, `is_background`. Align keys with your installed Cursor build and [Subagents](https://cursor.com/docs/context/subagents) if anything differs.
