import { MailtrapClient } from "mailtrap";
import type {
  SendTemplateEmailInput,
  SendTransactionalEmailInput,
  TransactionalMailPort,
} from "~~/application/ports/transactional-mail.port";

export type MailtrapTransactionalMailConfig = {
  apiKey: string;
  sandbox: boolean;
  testInboxId?: number;
};

export const MAILTRAP_TEMPLATES_IDS = {
  forgotPassword: "93f3dab6-d896-4318-bd57-2328b47dea6a",
  invitation: "9508cd9c-65c8-4bb3-9d06-efff128869c9",
} as const;

export class MailtrapTransactionalMailSender implements TransactionalMailPort {
  constructor(private readonly client: MailtrapClient) {}

  public sendTransactionalEmail = async (
    input: SendTransactionalEmailInput,
  ): Promise<void> => {
    await this.client.send({
      category: input.kind,
      from: input.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      ...(input.html !== undefined ? { html: input.html } : {}),
      ...(input.replyTo !== undefined ? { reply_to: input.replyTo } : {}),
    });
  };

  public sendTemplateEmail = async (
    input: SendTemplateEmailInput,
  ): Promise<void> => {
    await this.client.send({
      template_uuid: input.templateId,
      template_variables: input.variables,
      to: input.to,
      from: input.from,
      ...(input.replyTo !== undefined ? { reply_to: input.replyTo } : {}),
    });
  };
}

export const createMailtrapTransactionalMailSender = (
  config: MailtrapTransactionalMailConfig,
): TransactionalMailPort => {
  const client = new MailtrapClient({
    token: config.apiKey,
    sandbox: config.sandbox,
    testInboxId: config.sandbox ? config.testInboxId : undefined,
    bulk: false,
  });
  return new MailtrapTransactionalMailSender(client);
};
