import type { TokenTypeEnum } from "~~/shared/db-enums";

/**
 * Categories for transactional sends (Mailtrap `category` / internal tagging).
 * Values aligned with `token_type` in Prisma are used for magic-link flows; `contact`
 * is public form mail and does not persist a `token` row.
 */
export type TransactionalEmailKind = TokenTypeEnum | "contact";
