import { config } from 'dotenv';
import { z } from 'zod';

export const STAGES = {
  Dev: 'dev',
  Prod: 'prod',
} as const;

export type StageKey = keyof typeof STAGES;
export type Stage = (typeof STAGES)[StageKey];

config();

export function isTest() {
  return process.env.NODE_ENV === 'test';
}

const envSchema = z.object({
  APP_PORT: z.coerce.number().default(3000),
  STAGE: z.nativeEnum(STAGES).default(STAGES.Dev),
  DB_URL: z.string(),
  TEST_DB_URL: z.string(),
});

export const envConfig = envSchema.parse({
  APP_PORT: process.env.APP_PORT,
  STAGE: process.env.STAGE,
  DB_URL: process.env.DB_URL,
  TEST_DB_URL: process.env.TEST_DB_URL,
});

export type EnvConfig = z.infer<typeof envSchema>;
