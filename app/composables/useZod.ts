import { z } from "zod";

export const useZod = () => {
  const getZodIssues = (error: unknown): z.core.$ZodIssue[] | null => {
    if (error instanceof z.ZodError) {
      return error.issues;
    }
    return null;
  };

  return {
    getZodIssues,
  };
};
