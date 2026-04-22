import { describe, expect, it, vi } from "vitest";
import { MailtrapTransactionalMailSender } from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";

describe("MailtrapTransactionalMailSender", () => {
  it("forwards template_variables to Mailtrap send", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const sender = new MailtrapTransactionalMailSender({ send } as never);

    await sender.sendTemplateEmail({
      templateId: "4c226edb-5687-4870-88b4-aea6c6a572a8",
      variables: {
        user_name: "Sam",
        user_email: "sam@example.com",
        recovery_link: "https://example.com/reset-password?t=abc",
      },
      to: [{ email: "sam@example.com", name: "Sam" }],
      from: { email: "noreply@example.com", name: "Club" },
      subject: "Reset",
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        template_uuid: "4c226edb-5687-4870-88b4-aea6c6a572a8",
        template_variables: {
          user_name: "Sam",
          user_email: "sam@example.com",
          recovery_link: "https://example.com/reset-password?t=abc",
        },
        subject: "Reset",
      }),
    );
  });
});
