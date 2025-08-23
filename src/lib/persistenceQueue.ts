import { Queue, JobsOptions } from 'bullmq';
import { redisClient } from './redis';

export interface PersistenceJobData {
  messageId: string;
  roomId:     string;
  senderId:   string;
  textOriginal: string;
  langOriginal: string;
  timestamp:    string;  
}

const defaultJobOptions: JobsOptions = {
  removeOnComplete: 1_000,
  removeOnFail:     1_000,
  attempts:         2,
};

export const persistenceQueue = new Queue<PersistenceJobData>(
  'persistence-queue',
  { connection: redisClient, defaultJobOptions }
);
