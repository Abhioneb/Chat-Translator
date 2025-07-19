// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `prisma` to prevent multiple instances in dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // remove or adjust in production
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
