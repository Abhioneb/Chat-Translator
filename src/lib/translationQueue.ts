// src/lib/translationQueue.ts
import { Queue, JobsOptions } from 'bullmq';
import { redisClient } from './redis';

/**
 * Shape of the data for each translation job.
 */
export interface TranslationJobData {
  /** UUID of the message, used to correlate events */
  messageId: string;
  /** Original text to translate */
  text: string;
  /** Target language code (e.g. "es", "fr") */
  to: string;
  /** Socket.IO room ID where this message was sent */
  roomId: string;
}

/**
 * Default options applied to every translation job.
 * - removeOnComplete/removeOnFail keep Redis clean
 * - attempts/backoff for resilience
 */
const defaultJobOptions: JobsOptions = {
  removeOnComplete: 1_000,
  removeOnFail: 1_000,
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5_000, // start with 5s, then ~10s, then ~20s
  },
};

export const translationQueue = new Queue<TranslationJobData>(
  'translation-queue',
  {
    connection: redisClient,
    defaultJobOptions,
  }
);
