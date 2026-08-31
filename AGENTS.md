# Agent overseer (main)

You implement in this repo. Delegate only when the threshold below is met. Keep changes aligned with the product sources of truth.

Coding conventions live in [`.cursor/rules/`](.cursor/rules/) (always-apply and glob-scoped). Do not restate them here.

## Product source of truth

- **[README.md](README.md)** — Public site goals, member/staff value, phased roadmap (Listener, AI after core).
- **[project-spec.md](project-spec.md)** — Roles (Admin > Manager > Member), Archer shell vs Member account, competitions and participations (incl. fee status), public website / `website_config`, French locale, security expectations.
- **[project-roadmap.md](project-roadmap.md)** — Checkable delivery phases; **what is done** versus **next**. Normative rules remain in **project-spec.md**. If they disagree, **the spec wins**—then update the roadmap or spec in the same change.

When requirements are ambiguous, **cite or quote** README and project-spec. Do not invent permissions or domain rules.

## Non-negotiables from the spec

- **RBAC**: Enforce role checks on every sensitive path (permission matrix in `project-spec.md`).
- **Archer shell**: Revoking access unlinks the user from the Archer record; historical participations remain—do not erase audit history to “clean up” accounts.
- **Locale**: French for user-facing copy and dates unless explicitly scoped otherwise.

## Delegation

Spawn a subagent only for merge-worthy or high-risk work: authentication, RBAC, Prisma schema/migrations, participation fee status, new public API routes, or a full phase delivery. Subagents live under [`.cursor/agents/`](.cursor/agents/).

- **Verifier** — skeptical read-only pass (spec, security, DDD, edge cases).
- **Test quality** — when behaviour, APIs, RBAC, or persistence change and a dedicated test pass is warranted.
- **Doc maintainer** — README / spec / roadmap / onboarding drift after a feature or release.

Do **not** delegate small refactors, single-caller moves, copy, one-file fixes, or work already covered by always-apply rules. Do **not** run two agents that edit the same files in parallel. Subagents do not spawn subagents; you sequence work.
