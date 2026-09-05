import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubmitContactMessage } from "~~/application/contact/submit-contact-message.use-case";
import type {
  SendTemplateEmailInput,
  TransactionalMailPort,
} from "~~/application/ports/transactional-mail.port";

describe("SubmitContactMessage", () => {
  let mail: TransactionalMailPort;

  const options = {
    toEmail: "club@example.com",
    fromEmail: "noreply@example.com",
    fromName: "ARC18",
    sandbox: false,
    templateId: "contact-template-uuid",
    inviteOrigin: "https://app.example.com",
  };

  beforeEach(() => {
    mail = {
      sendTransactionalEmail: vi.fn(),
      sendTemplateEmail: vi.fn(),
    };
  });

  it("returns validation when name is empty", async () => {
    const submitContactMessage = new SubmitContactMessage(mail, options);
    const result = await submitContactMessage.submit({
      name: "   ",
      email: "a@b.co",
      subject: "Hello",
      message: "This is a long enough contact message.",
    });
    expect(result).toEqual({ ok: false, error: "validation" });
    expect(mail.sendTemplateEmail).not.toHaveBeenCalled();
  });

  it("returns validation when email is invalid", async () => {
    const submitContactMessage = new SubmitContactMessage(mail, options);
    const result = await submitContactMessage.submit({
      name: "Jean",
      email: "not-an-email",
      subject: "Hello",
      message: "This is a long enough contact message.",
    });
    expect(result).toEqual({ ok: false, error: "validation" });
    expect(mail.sendTemplateEmail).not.toHaveBeenCalled();
  });

  it("sends the contact template with replyTo and form variables", async () => {
    let captured: SendTemplateEmailInput | undefined;
    mail.sendTemplateEmail = vi.fn(async (input: SendTemplateEmailInput) => {
      captured = input;
    });
    const submitContactMessage = new SubmitContactMessage(mail, options);
    const result = await submitContactMessage.submit({
      name: "Marie Dupont",
      email: "Marie@Example.COM",
      subject: "Question",
      message: "Bonjour, je souhaite avoir plus d'informations.",
    });
    expect(result).toEqual({ ok: true });
    expect(captured?.templateId).toBe("contact-template-uuid");
    expect(captured?.replyTo).toEqual({
      email: "marie@example.com",
      name: "Marie Dupont",
    });
    expect(captured?.to).toEqual([{ email: "club@example.com" }]);
    expect(captured?.from).toEqual({
      email: "noreply@example.com",
      name: "ARC18",
    });
    expect(captured?.variables).toEqual({
      sender_name: "Marie Dupont",
      sender_email: "marie@example.com",
      privacy_policy_url: "https://app.example.com/privacy-policy",
      message_subject: "Question",
      message_body: "Bonjour, je souhaite avoir plus d'informations.",
    });
  });

  it("prefixes message_subject in sandbox mode", async () => {
    let captured: SendTemplateEmailInput | undefined;
    mail.sendTemplateEmail = vi.fn(async (input: SendTemplateEmailInput) => {
      captured = input;
    });
    const submitContactMessage = new SubmitContactMessage(mail, {
      ...options,
      sandbox: true,
    });
    await submitContactMessage.submit({
      name: "Test",
      email: "t@t.co",
      subject: "Subject",
      message: "This is a message with at least twenty characters.",
    });
    expect(captured?.variables?.message_subject).toBe("[Sandbox] Subject");
  });

  it("returns send_failed when mail throws", async () => {
    mail.sendTemplateEmail = vi.fn(async () => {
      throw new Error("network");
    });
    const submitContactMessage = new SubmitContactMessage(mail, options);
    const result = await submitContactMessage.submit({
      name: "Test",
      email: "t@t.co",
      subject: "Subj",
      message: "This is a message with at least twenty characters.",
    });
    expect(result).toEqual({ ok: false, error: "send_failed" });
  });
});
