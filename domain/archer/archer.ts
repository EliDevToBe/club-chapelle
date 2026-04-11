export type ArcherId = string;

export type Archer = {
  id: ArcherId;
  displayName: string;
  /** Club user account id when linked; null before onboarding or after revoke/unlink. */
  linkedUserId: string | null;
};
