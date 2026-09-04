export type CompleteInvitationInput = {
  authUserId: string;
  tokenValue: string;
  passwordHash: string;
};

export interface AcceptInvitationPersistence {
  /**
   * Sets password, marks the user authenticated, and consumes the invitation token
   * in one transaction. Returns `false` when the token is missing or already used.
   */
  completeInvitation: (input: CompleteInvitationInput) => Promise<boolean>;
}
