/** Full `auth_user` row shape. Do not return `password` in HTTP responses—use `AuthUserPublicDto`. */
export type AuthUserDto = {
  id: string;
  email: string;
  password: string;
  created_at: string;
  authenticated: boolean;
};

/** `auth_user` without secrets (e.g. API responses). */
export type AuthUserPublicDto = Omit<AuthUserDto, "password">;
