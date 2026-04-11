/** Uploaded file metadata (matches `file` table). Named `StoredFile` to avoid clashing with the global `File` API. */
export type StoredFile = {
  id: string;
  name: string;
  mimetype: string;
  url: string | null;
  bucketId: string | null;
  internalBucketName: string | null;
  createdAt: Date;
};
