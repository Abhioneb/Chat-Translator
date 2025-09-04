import { Worker, Job } from 'bullmq';
import axios from 'axios';
import { z } from 'zod';
import { translationQueue, TranslationJobData } from '@/lib/translationQueue';
import { redisClient } from '@/lib/redis';
import { env } from '@/lib/config';
import type { Logger } from 'pino';

// 1) Define a schema for the translation API response
const translationResponseSchema = z.object({
  data: z.object({
    translations: z.array(
      z.object({
        translatedText: z.string(),
      })
    ),
  }),
});

// 2) Typed logger (you can swap pino for your stack’s logger)
const logger: Logger = console as any;

// 3) The actual translation call, with Zod validation
async function translateText(text: string, to: string, from = 'auto'): Promise<string> {
  const res = await axios.post(
    env.TRANSLATION_API_URL,
    {
      q: text,
      source: from, 
      target: to,
      format: 'text', 
    },
    { timeout: 10_000 }
  );

  if (!res.data?.translatedText) {
    logger.error({ data: res.data }, 'Invalid LibreTranslate response');
    throw new Error('Unexpected LibreTranslate API response');
  }

  return res.data.translatedText;
}

// 4) Create the BullMQ worker
const worker = new Worker<TranslationJobData, string>(
  translationQueue.name,
  async (job: Job<TranslationJobData>) => {
    const { messageId, text, to } = job.data;
    const cacheKey = `translation:phrase:${to}:${text}`;

    // 4a) Try cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.debug({ messageId, cacheKey }, 'Translation cache hit');
      return cached;
    }

    // 4b) Perform translation
    const translated = await translateText(text, to);

    // 4c) Store in cache (24h TTL)
    await redisClient.set(cacheKey, translated, 'EX', 24 * 3600);

    logger.info({ messageId, to }, 'Translation complete');
    return translated;
  },
  {
    connection: redisClient,
    concurrency: env.WORKER_CONCURRENCY,
  }
);

// 5) On job completion—publish a Redis message for Socket.IO servers to pick up
worker.on('completed', async (job, translated: string) => {
  const { messageId, roomId } = job.data;
  const payload = JSON.stringify({ messageId, roomId, translated });
  await redisClient.publish('translation_completed', payload);
  logger.debug({ messageId, roomId }, 'Published translation_completed');
});

// 6) Log failures for visibility
worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Translation job failed');
});

// 7) Graceful shutdown
process.on('SIGINT', async () => {
  await worker.close();
  process.exit(0);
});

logger.info(`Translation worker started (concurrency=${env.WORKER_CONCURRENCY})`);
