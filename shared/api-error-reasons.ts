type ValuesOf<T extends Record<string, string>> = T[keyof T];

const flattenReasonValues = (
  registry: Record<string, Record<string, string>>,
): string[] => {
  const values: string[] = [];
  for (const category of Object.values(registry)) {
    for (const value of Object.values(category)) {
      values.push(value);
    }
  }
  return values;
};

export const API_ERROR_REASON = {
  common: {
    not_found: "not_found",
    missing_id: "missing_id",
    invalid_request: "invalid_request",
    invalid_query: "invalid_query",
    forbidden: "forbidden",
    unauthenticated: "unauthenticated",
  },
  user: {
    self_revoke: "self_revoke",
  },
  user_role: {
    self_change: "self_change",
    admin_target: "admin_target",
    last_admin: "last_admin",
  },
  archer: {
    linked: "archer_linked",
    already_offboarded: "already_offboarded",
    not_offboarded: "not_offboarded",
  },
  invitation: {
    account_already_active: "account_already_active",
    account_already_invited: "account_already_invited",
    public_name_taken: "public_name_taken",
    archer_already_linked: "archer_already_linked",
    email_already_linked: "email_already_linked",
  },
  auth: {
    not_configured: "auth_not_configured",
    invalid_credentials: "invalid_credentials",
    account_not_active: "account_not_active",
    invalid_token: "invalid_token",
    invalid_email: "invalid_email",
  },
  mail: {
    not_configured: "mail_not_configured",
    sender_not_configured: "mail_sender_not_configured",
    sandbox_inbox_not_configured: "mail_sandbox_inbox_not_configured",
    send_failed: "send_failed",
  },
  website: {
    sirv_not_configured: "website_sirv_not_configured",
    no_files_provided: "no_files_provided",
    no_valid_files: "no_valid_files",
    invalid_site_settings: "invalid_site_settings",
    invalid_opening_hours: "invalid_opening_hours",
    invalid_text_section: "invalid_text_section",
    invalid_tarifs: "invalid_tarifs",
  },
  contact: {
    recipient_not_configured: "contact_recipient_not_configured",
    invalid_form_data: "invalid_form_data",
  },
} as const;

export type CommonApiErrorReason = ValuesOf<typeof API_ERROR_REASON.common>;
export type UserApiErrorReason = ValuesOf<typeof API_ERROR_REASON.user>;
export type UserRoleApiErrorReason = ValuesOf<
  typeof API_ERROR_REASON.user_role
>;
export type ArcherApiErrorReason = ValuesOf<typeof API_ERROR_REASON.archer>;
export type InvitationApiErrorReason = ValuesOf<
  typeof API_ERROR_REASON.invitation
>;
export type AuthApiErrorReason = ValuesOf<typeof API_ERROR_REASON.auth>;
export type MailApiErrorReason = ValuesOf<typeof API_ERROR_REASON.mail>;
export type WebsiteApiErrorReason = ValuesOf<typeof API_ERROR_REASON.website>;
export type ContactApiErrorReason = ValuesOf<typeof API_ERROR_REASON.contact>;

export type ApiErrorReason =
  | CommonApiErrorReason
  | UserApiErrorReason
  | UserRoleApiErrorReason
  | ArcherApiErrorReason
  | InvitationApiErrorReason
  | AuthApiErrorReason
  | MailApiErrorReason
  | WebsiteApiErrorReason
  | ContactApiErrorReason;

export const API_ERROR_STATUS: Record<ApiErrorReason, number> = {
  not_found: 404,
  missing_id: 400,
  invalid_request: 400,
  invalid_query: 400,
  forbidden: 403,
  unauthenticated: 401,
  self_revoke: 400,
  self_change: 400,
  admin_target: 403,
  last_admin: 400,
  archer_linked: 409,
  already_offboarded: 409,
  not_offboarded: 409,
  account_already_active: 409,
  account_already_invited: 409,
  public_name_taken: 409,
  archer_already_linked: 409,
  email_already_linked: 409,
  auth_not_configured: 500,
  invalid_credentials: 401,
  account_not_active: 401,
  invalid_token: 400,
  invalid_email: 400,
  mail_not_configured: 500,
  mail_sender_not_configured: 500,
  mail_sandbox_inbox_not_configured: 500,
  send_failed: 500,
  website_sirv_not_configured: 500,
  no_files_provided: 400,
  no_valid_files: 400,
  invalid_site_settings: 400,
  invalid_opening_hours: 400,
  invalid_text_section: 400,
  invalid_tarifs: 400,
  contact_recipient_not_configured: 500,
  invalid_form_data: 400,
};

const API_ERROR_REASON_VALUES = new Set<string>(
  flattenReasonValues(API_ERROR_REASON),
);

export const isApiErrorReason = (
  value: string | undefined,
): value is ApiErrorReason => {
  if (value === undefined) {
    return false;
  }

  return API_ERROR_REASON_VALUES.has(value);
};
