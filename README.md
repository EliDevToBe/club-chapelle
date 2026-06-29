# ARC18 — Les Archers de La Chapelle

**A modern website and club operating hub** for Les Archers de La Chapelle (ARC18), an archery club in Paris. This project replaces the [previous Wix site](https://archerschapelle.wixsite.com/arc18) with something the club owns: easier to update, clearer for visitors, and connected to how the club really works—competitions, sign-ups, and who has paid what.

## Why this exists

Club life today mixes a public showcase (photos, news, contact) with operational work that often lives in messages and spreadsheets. ARC18 brings those strands together: one place for the world to discover the club, and one place for members and staff to see competitions, track participation, and follow payments—without losing history when people join or leave.

## Who it is for

- **Visitors and future members** — discover the club, see practical information, and get in touch.
- **Members** — sign in to see competitions that matter to them and their own registrations in one view.
- **Managers and administrators** — run day-to-day club operations: inviting members, managing competitions and participants, and keeping payment follow-up under control—with roles that match real responsibility.

## What you get

**Public site (simple and clear)**  
A small set of main areas—**landing**, **infos**, **contact**—with room for club photos, news-style updates, and links to Instagram and Facebook so the club stays visible where people already are.

**Signed-in members**  
Browse available competitions and see **their** participations in a **list/card view** at `/competitions` (date range, search, and a **Les miennes** filter; own fee and registration status where the role allows). **Calendar-style** views are planned for a later phase—see [project-spec.md](project-spec.md) and [project-roadmap.md](project-roadmap.md).

**Back-office for the club**  
Staff use a dedicated space to manage **archers**, **competitions**, and **participation** (who goes where), including **payment status** and reminders. Access is gated by **roles** (Admin, Manager, Member) so each person only sees and does what matches their job—not a one-size-fits-all dashboard.

## Main objective

Give Les Archers de La Chapelle a **single, trustworthy picture** of club life online and in operations: public communication that reflects the club today, and internal workflows so the team always knows **who is registered for which competition, when it happens, and whether their fee is settled**—with room to grow into smarter tools (like monitoring federation competition pages) in later phases, not in the first release.

## What comes later

Advanced features—such as automatically **listening** to French archery federation listings for new “mandat”-style entries, or **AI-assisted** suggestions to enrich the competition pool—are planned **after** the core site and back-office are solid. Details and phased delivery are in **[project-spec.md](project-spec.md)**.

## Release and deployment flow

- Feature work targets `develop` through pull requests.
- Production promotion is done through a release pull request from `develop` to `main` (created by `.github/workflows/release.yml`).
- Direct pushes to `main` should be blocked by branch protection.
- Required checks on the release PR should include CI from `.github/workflows/ci.yml`.
- Database deployment runs from `.github/workflows/cd-database.yml` on `main` only when Prisma files changed in the pushed range (or on manual dispatch).
