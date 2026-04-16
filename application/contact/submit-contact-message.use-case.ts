import { contactFormSchema } from "~~/app/schemas/contact-form.zod";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";

export type SubmitContactMessageResult =
  | { ok: true }
  | { ok: false; error: "validation" }
  | { ok: false; error: "send_failed" };

export type SubmitContactMessageOptions = {
  toEmail: string;
  fromEmail: string;
  fromName: string;
  sandbox: boolean;
};

export class SubmitContactMessage {
  constructor(
    private readonly mail: TransactionalMailPort,
    private readonly options: SubmitContactMessageOptions,
  ) {}

  public submit = async (input: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<SubmitContactMessageResult> => {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const subjectRaw = input.subject.trim();
    const message = input.message.trim();

    const { success } = contactFormSchema.safeParse({
      name,
      email,
      subject: subjectRaw,
      message,
    });

    if (!success) {
      return { ok: false, error: "validation" };
    }

    const subject = this.options.sandbox
      ? `[Sandbox] ${subjectRaw}`
      : subjectRaw;

    try {
      await this.mail.sendTransactionalEmail({
        kind: "contact",
        to: [{ email: this.options.toEmail }],
        from: {
          email: this.options.fromEmail,
          name: this.options.fromName,
        },
        replyTo: { email, name },
        subject,
        text: message,
      });
      return { ok: true };
    } catch {
      return { ok: false, error: "send_failed" };
    }
  };
}
