/** Full `archer` row shape (dates as ISO `YYYY-MM-DD`). */
export type ArcherDto = {
  id: string;
  auth_user_id: string | null;
  public_name: string;
  created_at: string;
  offboarded_at: string | null;
};

export type ArcherCreateDto = {
  auth_user_id?: string | null;
  public_name: string;
  offboarded_at?: string | null;
};

export type ArcherUpdateDto = Partial<ArcherCreateDto>;
