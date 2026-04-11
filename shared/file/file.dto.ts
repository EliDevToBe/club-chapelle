/** Full `file` row shape (dates as ISO `YYYY-MM-DD`). */
export type FileDto = {
  id: string;
  name: string;
  mimetype: string;
  url: string | null;
  bucket_id: string | null;
  internal_bucket_name: string | null;
  created_at: string;
};
