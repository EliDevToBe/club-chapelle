import { contactFormSchema } from "~~/app/schemas/contact-form.zod";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import type { EmailOptions } from "~~/domain/mail/email-options";

export type SubmitContactMessageResult =
  | { ok: true }
  | { ok: false; error: "validation" }
  | { ok: false; error: "send_failed" };

export type SubmitContactMessageOptions = EmailOptions & {
  toEmail: string;
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

    const privacyPolicyUrl = new URL(
      "/privacy-policy",
      this.options.siteOrigin,
    ).toString();

    try {
      await this.mail.sendTemplateEmail({
        templateId: this.options.templateId,
        variables: {
          sender_name: name,
          sender_email: email,
          privacy_policy_url: privacyPolicyUrl,
          message_body: message,
        },
        to: [{ email: this.options.toEmail }],
        from: {
          email,
          name,
        },
        replyTo: { email, name },
      });
      return { ok: true };
    } catch {
      return { ok: false, error: "send_failed" };
    }
  };
}
