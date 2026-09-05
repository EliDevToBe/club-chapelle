export type InvitationTokenCreatedAt = {
  created_at: Date;
};

export const resolveLatestInvitationAt = (
  invitationTokens: readonly InvitationTokenCreatedAt[],
  userCreatedAt: Date,
): Date => {
  const latestInvitation = invitationTokens[0];
  if (!latestInvitation) {
    return userCreatedAt;
  }
  return latestInvitation.created_at;
};
