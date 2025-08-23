import { z } from 'zod';

export const envSchema = z.object({
  REDIS_URL: z.string().url(),
  TRANSLATION_API_KEY: z.string(),
  TRANSLATION_API_URL: z.string().url(),
  WORKER_CONCURRENCY: z
    .string()
    .optional()
    .default('5')                    
    .transform((val) => parseInt(val, 10)), 
});

export const env = envSchema.parse(process.env);
