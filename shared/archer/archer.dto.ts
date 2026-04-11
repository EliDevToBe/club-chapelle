/** Full `archer` row shape (dates as ISO `YYYY-MM-DD`). */
export type ArcherDto = {
  id: string;
  auth_user_id: string | null;
  name: string;
  created_at: string;
  offboarded_at: string;
};
