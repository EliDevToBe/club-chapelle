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
      to: input.to,
      from: input.from,
      subject: input.subject,
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
