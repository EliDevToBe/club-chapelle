# Bureau checklist (GDPR / CNIL)

Companion to [registre-des-traitements.md](registre-des-traitements.md). These items are **operational**: they are not implemented as product features. The public privacy policy is not enough without them.

## Before a public production launch

- [ ] Fill **legal identity** in Admin → Paramètres du site: registered office (not the gym), publication director (président·e), RNA, SIRET if any, hosting provider name / address / phone.
- [ ] Check `/legal-notice` and `/privacy-policy` show those values.
- [ ] Confirm Mailtrap, Sirv, and the hosting provider each have a **data-processing agreement** (DPA) covering the association.
- [ ] If a processor stores data **outside the EEA**, record the safeguards (e.g. standard contractual clauses) and keep the privacy page accurate.
- [ ] Name **who answers data-subject requests** (access, rectification, erasure, objection). Target: **one month**.

## Ongoing

- [ ] Do **not** add a “I accept the GDPR” checkbox on the contact form (false consent). Keep the information notice and the link to `/privacy-policy`.
- [ ] Member space stays **invitation-only**. Invitations exist: confirm the Mailtrap invitation template includes `/privacy-policy` (variable `privacy_policy_url`); activation form already shows an information notice; **no** public terms-of-use tick box.
- [ ] Photos of identifiable people (especially ages 14–17): image-rights agreement before publishing on the carousel.
- [ ] No analytics, pixels, or client-side Facebook SDK without a **cookie banner** and an update to this register.
- [ ] No online payment / distance selling without **terms of sale** (CGV) and a privacy update.

## Personal-data breach

If personal data is lost, stolen, or exposed:

1. Contain the incident (revoke secrets, take the surface offline if needed).
2. Assess risk to people (identity, login, payment **status**, photos, messages).
3. If there is a risk: notify the **CNIL within 72 hours** via [notifications.cnil.fr](https://notifications.cnil.fr).
4. If the risk is high: also inform the people concerned.
5. Record what happened, what was done, and any notice sent.

## Rights requests

People write to the public contact e-mail. Log the date, identity check, what was asked, and the reply. There is no self-service export/delete portal; officers handle requests manually, consistent with the size of the club.
