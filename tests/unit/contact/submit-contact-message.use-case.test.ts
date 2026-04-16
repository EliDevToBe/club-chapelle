import { describe, expect, it, vi } from "vitest";
import { SubmitContactMessage } from "~~/application/contact/submit-contact-message.use-case";
import type {
  SendTransactionalEmailInput,
  TransactionalMailPort,
} from "~~/application/ports/transactional-mail.port";

describe("SubmitContactMessage", () => {
  const options = {
    toEmail: "club@example.com",
    fromEmail: "noreply@example.com",
    fromName: "ARC18",
    sandbox: false,
  };

  it("returns validation when name is empty", async () => {
    const mail: TransactionalMailPort = {
      sendTransactionalEmail: vi.fn(),
      sendTemplateEmail: vi.fn(),
    };
    const submitContactMessage = new SubmitContactMessage(mail, options);
    const result = await submitContactMessage.submit({
      name: "   ",
      email: "a@b.co",
      subject: "Hello",
      message: "This is a long enough contact message.",
    });
    expect(result).toEqual({ ok: false, error: "validation" });
    expect(mail.sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("returns validation when email is invalid", async () => {
    const mail: TransactionalMailPort = {
      sendTransactionalEmail: vi.fn(),
      sendTemplateEmail: vi.fn(),
    };
    const submitContactMessage = new SubmitContactMessage(mail, options);
    const result = await submitContactMessage.submit({
      name: "Jean",
      email: "not-an-email",
      subject: "Hello",
      message: "This is a long enough contact message.",
    });
    expect(result).toEqual({ ok: false, error: "validation" });
    expect(mail.sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("sends mail with kind contact and replyTo", async () => {
    let captured: SendTransactionalEmailInput | undefined;
    const mail: TransactionalMailPort = {
      sendTransactionalEmail: vi.fn(
        async (input: SendTransactionalEmailInput) => {
          captured = input;
        },
      ),
      sendTemplateEmail: vi.fn(),
    };
    const submitContactMessage = new SubmitContactMessage(mail, options);
    const result = await submitContactMessage.submit({
      name: "Marie Dupont",
      email: "Marie@Example.COM",
      subject: "Question",
      message: "Bonjour, je souhaite avoir plus d'informations.",
    });
    expect(result).toEqual({ ok: true });
    expect(captured?.kind).toBe("contact");
    expect(captured?.replyTo).toEqual({
      email: "marie@example.com",
      name: "Marie Dupont",
    });
    expect(captured?.to).toEqual([{ email: "club@example.com" }]);
    expect(captured?.subject).toBe("Question");
    expect(captured?.text).toBe(
      "Bonjour, je souhaite avoir plus d'informations.",
    );
  });

  it("prefixes subject in sandbox mode", async () => {
    let captured: SendTransactionalEmailInput | undefined;
    const mail: TransactionalMailPort = {
      sendTransactionalEmail: vi.fn(
        async (input: SendTransactionalEmailInput) => {
          captured = input;
        },
      ),
      sendTemplateEmail: vi.fn(),
    };
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
    expect(captured?.subject).toBe("[Sandbox] Subject");
  });

  it("returns send_failed when mail throws", async () => {
    const mail: TransactionalMailPort = {
      sendTransactionalEmail: vi.fn(async () => {
        throw new Error("network");
      }),
      sendTemplateEmail: vi.fn(),
    };
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
