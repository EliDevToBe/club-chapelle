# Processing record (simplified)

Internal document for Les Archers de La Chapelle (ARC18). This is the association’s **register of processing activities** (GDPR art. 30), in the simplified form recommended by the CNIL for small organisations. It is **not** a public web page.

**Data controller:** Les Archers de La Chapelle (association).  
**Contact:** the public contact e-mail on the site (`contact_email` in site settings).  
**DPO:** none designated (small sports association; no large-scale systematic monitoring).  
**Last reviewed:** 2026-08-25.

| Purpose | Data | Legal basis | Recipients | Retention (indicative) |
| --- | --- | --- | --- | --- |
| Contact form | Name, e-mail, subject, message | Legitimate interest / pre-contractual steps | Club officers; Mailtrap | Duration of the exchange, then about 12 months; no prospecting file |
| Member accounts (invitation only) | Name, e-mail, password hash (Argon2id), roles | Legitimate interest / running the membership | Officers with access rights; hosting provider | While access is active; login removed on revoke |
| Club operations (archers, competitions, participations, **fee status**) | Public name, event data, registration and payment **status** (no card data; no online payment) | Legitimate interest of club life; accounting duties where they apply | Officers (Admin/Manager per RBAC) | After unlink, archer row and history remain (Archer shell); season plus limited archive |
| Password recovery | E-mail, one-time token | Legitimate interest (account security) | Mailtrap | Until `used_at` or about 1 hour |
| Session cookies (`club-access`, `club-refresh`) | JWT in HttpOnly cookies | Legitimate interest (strictly necessary auth) | Browser of the signed-in user only | Access ~20 minutes; refresh 7 days |
| Landing carousel photos | Image files; possibly identifiable people | Legitimate interest of club life and/or consent (especially minors) | Sirv (CDN); public visitors | While published; removal on request |
| Facebook news (Actualités) | Public page posts fetched server-side | Legitimate interest (communication) | Hosting; outbound links to Meta | No lasting copy of visitor data; no visitor tracking cookies |

No analytics, no commercial prospecting, no sale of data.

**Minors:** members from age 14; accounts by invitation only. In France, solo consent to an information-society service is 15. Invitations for ages 14–15 sit in a parental / legal-representative frame.

**Security (summary):** Argon2id password hashes, HttpOnly session cookies, role checks on APIs, Facebook API secrets server-side only.

When a new purpose is added (trackers, online payment, open sign-up), add a row here **in the same change** and update `/privacy-policy`.
