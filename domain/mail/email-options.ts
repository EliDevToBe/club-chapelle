/** Shared Mailtrap template send metadata wired at the HTTP composition root. */
export type EmailOptions = {
  fromEmail: string;
  fromName: string;
  templateId: string;
  siteOrigin: string;
};
