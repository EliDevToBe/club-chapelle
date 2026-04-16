import type { TransactionalEmailKind } from "~~/shared/email/transactional-email-kind";

export type TransactionalMailAddress = {
  email: string;
  name?: string;
};

export type SendTransactionalEmailInput = {
  kind: TransactionalEmailKind;
  to: TransactionalMailAddress[];
  from: TransactionalMailAddress;
  replyTo?: TransactionalMailAddress;
  subject: string;
  text: string;
  html?: string;
};

export type SendTemplateEmailInput = {
  templateId: string;
  variables: Record<string, string>;
  to: TransactionalMailAddress[];
  from: TransactionalMailAddress;
  replyTo?: TransactionalMailAddress;
  subject: string;
};

export interface TransactionalMailPort {
  sendTransactionalEmail: (input: SendTransactionalEmailInput) => Promise<void>;
  sendTemplateEmail: (input: SendTemplateEmailInput) => Promise<void>;
}
