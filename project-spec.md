# ARC18 — Technical & product specification

This document describes goals, functional requirements, role permissions, domain concepts, phased delivery, and constraints for the full rework of the [ARC18 Wix site](https://archerschapelle.wixsite.com/arc18). The public-facing story lives in `[README.md](README.md)`.

## 1. Project goals & success criteria

**Goals**

- Replace the legacy showcase with a **simple, maintainable** web app that covers **public information** and **internal club operations** in one product.
- Provide a **single source of truth** for competitions, who participates, and **payment status** per participation—reducing reliance on ad hoc spreadsheets and threads.
- Enforce **clear roles** (Admin, Manager, Member) with **inheritance** so higher roles include lower-tier permissions without duplication of rules in the UI copy.

**Success criteria (indicative)**

- Staff can create a competition, attach participants, and see **who still owes a fee** in one overview.
- A **Member** can log in and see **only** their participations (and public competition listings as defined).
- **Revoking** access does not erase historical participation data (see **Archer shell** below).
- Public visitors can navigate **landing**, **infos**, and **contact**, view **images** managed by the club, and reach **Instagram** and **Facebook**.

## 2. Public website


| Area        | Purpose                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| **Landing** | First impression, key messages, entry to the rest of the site.                                       |
| **Infos**   | Practical and club information (schedule pointers, club life, etc.—exact content TBD with the club). |
| **Contact** | How to reach the club (address, email, map or directions as needed).                                 |


**Media**

- **Image upload / gallery:** club-managed visuals (implementation detail: storage and who may upload—at minimum **staff**; exact role TBD, default assumption **Admin** or **Manager** for uploads).

**Social**

- Prominent **Instagram** and **Facebook** links (URLs configurable). Optional later: embeds or feeds—not required for MVP.

**Reference**

- Legacy site for content parity and tone: [archerschapelle.wixsite.com/arc18](https://archerschapelle.wixsite.com/arc18).

## 3. Authentication & authorization

### 3.1 Role hierarchy

Three roles with **strict ordering**: **Admin > Manager > Member**.

- A **higher** role **inherits** all permissions of **lower** roles unless an exception is explicitly stated (none below—Admin-only actions are listed separately).

### 3.2 Permission matrix

Capabilities are cumulative by level.


| Capability                                                                                             | Member | Manager | Admin |
| ------------------------------------------------------------------------------------------------------ | ------ | ------- | ----- |
| View public pages                                                                                      | ✅     | ✅      | ✅    |
| Log in                                                                                                 | ✅     | ✅      | ✅    |
| Browse **available competitions** (club-managed list/pool)                                             | ✅     | ✅      | ✅    |
| View **own** participations                                                                            | ✅     | ✅      | ✅    |
| Calendar-style view of **own** participations (when shipped)                                           | ✅     | ✅      | ✅    |
| Public calendar of **available** competitions (when shipped)                                           | ✅     | ✅      | ✅    |
| **Invite** a new Member (email-based onboarding)                                                       | ❌     | ✅      | ✅    |
| **Create** new Member accounts via invite flow                                                         | ❌     | ✅      | ✅    |
| **Competition Listener:** configure / “listen” to an external federation listing (when shipped)        | ❌     | ✅      | ✅    |
| **Create / edit** competition events and their details                                                 | ❌     | ❌      | ✅    |
| **Assign** Members or Managers as **participants** of a competition                                    | ❌     | ❌      | ✅    |
| **Payment:** view and change payment **status** for a Member **for a given competition participation** | ❌     | ❌      | ✅    |
| **Payment:** **one-click** actions (e.g. send payment request / reminder email)                        | ❌     | ❌      | ✅    |
| **Promote** a Member to Manager; **demote** Manager to Member                                          | ❌     | ❌      | ✅    |
| **Revoke** Member or Manager access; **unlink** login from internal **Archer** record                  | ❌     | ❌      | ✅    |


**Admin overview (dedicated)**

- Consolidated place to **manage members** (promote, revoke, etc.), **roles**, a **dashboard** of **missing payments**, and **quick** payment **email reminders** (aligned with one-click payment actions).

**Explicit exclusions**

- Only **Admin** may **revoke** and **unlink** accounts from the **Archer** shell (preserving history).
- **Creating competitions** and **assigning participants** is **Admin-only** (not Manager) per current spec.

## 4. Domain concepts

### 4.1 Archer (internal shell)

An **Archer** is an internal entity representing a person in the club’s data model. It can exist **before** any login exists (e.g. v1 back-office without email linking).

- Holds **historical** links to **participations** and related records.
- When a **Member** account is **revoked**, the **user** is unlinked from the Archer; the **Archer** and past participations remain for audit and continuity.

### 4.2 Member (authenticated user)

A **Member** is a user account that may be **linked** to an Archer. Invitations (Manager/Admin) create or bind this link.

### 4.3 Competition & participation

- **Competition:** an event managed in the system (metadata: dates, title, detail fields—exact schema TBD).
- **Participation:** association of an **Archer** (or resolved via Member → Archer) to a **Competition**, with **payment status** and workflow actions driven by **Admin**.

## 5. Competitions, participations, payments

- **Admin** creates competitions and details; assigns **Members** and/or **Managers** as participants (Managers participate as archers when assigned).
- Each participation carries **payment state** (exact states TBD—e.g. unpaid / pending / paid).
- **Notifications:** at minimum **email** for **payment requests** and **reminders** initiated by Admin (one-click flows).

## 6. Calendars


| Audience             | Content                                                                 | Notes                                                          |
| -------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Anyone**           | Calendar (or equivalent) of **available** competitions in the club pool | Placement TBD: dedicated route vs section on an existing page. |
| **Logged-in Member** | Calendar (or equivalent) of **their** participations                    | Must respect Member-only data visibility.                      |


## 7. Competition Listener (advanced phase)

**Intent:** A **Manager** can register a **French archery federation** (or similar) **competition listing URL**—for example the FFTA competitions search result page—and the system **listens** for a **new “Mandat”** (or equivalent signal) appearing.

**Example URL shape (illustrative):**

`https://www.ffta.fr/index.php/competitions?search=&start=2026-04-10&end=2027-04-10&discipline=All&univers=299&inter=All&sort_by=start&sort_order=ASC`

**Mechanism (baseline):**

- **Scheduled job** (cron) + **basic scraping** / diff of the page or listing.
- **Email** (or in-app) **notification** when a new relevant entry is detected.

**Non-functional / compliance**

- Respect **robots.txt**, **terms of use**, and **rate limits**; implement **failure handling** (timeouts, HTML changes).
- Scraping may break when the source site changes—product should tolerate **degraded** mode and manual fallback.

## 8. Future: AI-assisted competition discovery (v4)

Evolve the Listener into an **AI-oriented workflow** that:

- Suggests **competitions** from a **small set of trusted sources** defined by the maintainer.
- Proposes **details** for competitions **not yet** in the club pool.
- Requires **human confirmation** before anything is published to the official competition list.

## 9. Non-functional requirements

- **Locale / context:** French club; UI copy and dates should align with French expectations.
- **Simplicity:** favor a **small** surface area over feature sprawl in early releases.
- **Accessibility:** baseline WCAG-minded patterns (exact audit scope TBD).
- **Security:** role checks on **every** sensitive action; protect **PII** and session boundaries.

---

## 10. Roadmaps

### 10.1 Primary roadmap (author’s plan)


| Phase    | Scope                                                                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MVP**  | Base **informational / showcase** website (public).                                                                                                       |
| **v1**   | **Back-office:** archers (internal shell), **competitions**, **participations**—**without** email linking yet (Archer before full Member implementation). |
| **v1.5** | **Member invitation**, **role management**, **Admin** panel **overview**.                                                                                 |
| **v2**   | **Calendar** overview (public competitions + member participations as specified).                                                                         |
| **v3**   | **Competition Listener** (cron + scrape + notify).                                                                                                        |
| **v4**   | **AI-assisted** workflow to seek and suggest competitions from **trusted** sources, with human validation.                                                |


### 10.2 Alternative roadmap (comparison)

Same product goals; different **sequencing** to reduce rework and front-load **RBAC** and **payments** once data exists.


| Phase    | Scope                                                                                                                                          |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **MVP**  | Same: public showcase (**landing**, **infos**, **contact**), images, social links.                                                             |
| **v1**   | Archer, competitions, participations; add a **read-only competition list** (table/list, not full calendar) for internal validation.            |
| **v1.5** | **Authentication + RBAC** first; then **invitations** and account linking.                                                                     |
| **v2**   | **Full calendar** experience: public competitions + **my participations** for logged-in members.                                               |
| **v2.5** | **Payments** polish: Admin **overview**, missing-payment **dashboard**, **quick email reminders**—explicit release before Listener if desired. |
| **v3**   | **Competition Listener** (cron / scrape / email).                                                                                              |
| **v4**   | **AI-assisted** discovery (trusted sources, human confirmation).                                                                               |


**Comparison:** The primary roadmap emphasizes **content and data model** before **auth**; the alternative introduces **auth and roles earlier** and may add a **thin list** before a **full calendar**, plus an optional **v2.5** payment-focused milestone. Either can be mixed (e.g. adopt “RBAC in v1.5” from the alternative without changing MVP numbering).