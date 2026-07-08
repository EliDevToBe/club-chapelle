export const normaliseSocialUrl = (value: string): string => {
  return value.trim().replace(/\/+$/, "");
};
