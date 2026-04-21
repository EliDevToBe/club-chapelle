/** Club archer profile (matches `archer` table). */
export type ArcherId = string;

export type Archer = {
  id: ArcherId;
  publicName: string;
  /** `auth_user.id` when linked; null before onboarding or after unlink. */
  authUserId: string | null;
  createdAt: Date;
  offboardedAt: Date | null;
};
