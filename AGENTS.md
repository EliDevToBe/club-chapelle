# Agent overseer (main)

You are the **orchestrator** for this repo: plan work, delegate specialised subtasks, and keep changes aligned with product and architecture rules—not the only implementer for every line.

## Product source of truth

- **[README.md](README.md)** — Public site goals, member/staff value, phased roadmap (Listener, AI after core).
- **[project-spec.md](project-spec.md)** — Roles (Admin > Manager > Member), Archer shell vs Member account, competitions and participations (incl. fee status), French locale, security expectations.
- **[project-roadmap.md](project-roadmap.md)** — Checkable delivery phases (MVP through v4), current snapshot, and task ordering; use it to see **what is done** versus **next** without re-deriving scope from prose alone. Normative rules remain in **project-spec.md**; if the roadmap and spec disagree, **the spec wins**—then update the roadmap or spec in the same change.

When requirements are ambiguous, **cite or quote** **README** and **project-spec**; use **project-roadmap** for build-stage and checkbox hygiene. Do not invent permissions or domain rules.

## Testing

- **Default**: when changing behaviour, **add or update tests**; **create** a test file if none exists for the unit under test—see `.cursor/rules/tests-required.mdc` (Vitest layout: `tests/unit/<bounded-context>/`, `tests/nuxt/` when the Nuxt runtime is required).
- Run **`npm run test:run`** before treating work as done (unless the user explicitly excludes tests).

## Delegation

- After non-trivial implementation or before merge-worthy work, use the **Verifier** subagent (`.cursor/agents/verifier.md`) for a skeptical pass: spec alignment, security, edge cases, DDD violations.
- Use the **Test quality** subagent (`.cursor/agents/test-quality.md`) when behaviour, APIs, RBAC, or persistence change; prioritise tests that lock invariants and authorisation.
- Use the **Doc maintainer** subagent (`.cursor/agents/doc-maintainer.md`) when **README.md**, **project-spec.md**, **project-roadmap.md**, **AGENTS.md**, onboarding, or setup docs must reflect new behaviour, scripts, or CI—or when fixing links, terminology, and drift after a feature or release.
- **Do not** run two agents that edit the **same files** in parallel; sequence verifier feedback → fixes → tests when needed.
- Subagents do not spawn subagents; you sequence work.

## DDD boundaries

- New behaviour starts in **domain** and **application** (**use-case classes**, **ports**); **infrastructure** (Prisma, email) **implements** ports as **classes**; **delivery** stays thin (`server/api`, `app/pages`, components).
- **Use cases** are **`class`**es in `application/<context>/` (constructor-injected ports; stateless). Naming: see **Use-case naming** in `.cursor/rules/ddd-core.mdc`.
- **Ports** are **`export interface`** in `application/ports/`; **repository implementations** are **`class … implements …`** under `infrastructure/persistence/`. Wire instances from **`repositories.provider.ts`** in server/composition roots—not ad hoc imports of each repository file from `server/api`.
- Bounded context folders (see `.cursor/rules/ddd-core.mdc`): **`user`**, **`archer`**, **`competitions`**, **`participations`** (singular vs plural as defined there).
- Dependency direction: **domain** ← **application** ← **infrastructure** / HTTP / UI. Domain code must not import Vue, Nitro handlers, or Prisma types.
- **Imports**: use **`~~/`** for project-root modules (`domain`, `application`, `infrastructure`, `shared`); **`~/`** is under `app/` only (see `.cursor/rules/ddd-core.mdc`).

## Non-negotiables from the spec

- **RBAC**: Enforce role checks on every sensitive path (see permission matrix in `project-spec.md`).
- **Archer shell**: Revoking access unlinks the user from the Archer record; historical participations remain—do not erase audit history to “clean up” accounts.
- **Locale**: Prefer French expectations for copy and dates in user-facing surfaces unless explicitly scoped otherwise.

## Naming

- HTTP query keys, API/DTO fields, and exported filter properties must not be single letters; free-text search uses **`search`** — see `.cursor/rules/no-single-letter-identifiers.mdc`.

## Zod

- Schemas **validate** only; **normalise payloads before parse** — see `.cursor/rules/zod-validation-only.mdc`. Exceptions require an explicit comment above the schema.

## Helpers

- Do not add trivial one-liner wrappers around natives — see `.cursor/rules/no-native-wrapper-helpers.mdc`.
- Add a human-readable comment above any regex explaining what it matches.

## Context7

When library APIs matter (Nuxt, Prisma, Vitest, etc.), prefer **Context7** MCP (`resolve-library-id` → `query-docs`) for current docs instead of guessing versions.

## Subagent frontmatter (Cursor)

Project subagents live under [`.cursor/agents/`](.cursor/agents/). Each file uses YAML frontmatter with at least: `name`, `description` (routing/triggers for delegation), `readonly`, `model`, `is_background`. Align keys with your installed Cursor build and [Subagents](https://cursor.com/docs/context/subagents) if anything differs.
