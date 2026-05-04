import { z } from 'zod';

// Helper to wrap a data schema inside a standard API response envelope.
// Adjust as needed if your backend returns a different shape.
export const responseSchema = <T extends z.ZodTypeAny>(payload: T) =>
  z.object({
    data: payload,
  });

// Example generic error schema (optional).
export const errorSchema = z.object({
  message: z.string(),
  code: z.number().optional(),
});
