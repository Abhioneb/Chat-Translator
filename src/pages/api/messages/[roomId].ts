// pages/api/messages/[roomId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type HistoryRequest = {
  beforeId?: string;
  limit?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { roomId } = req.query as { roomId: string };
  const { beforeId, limit = 50 } = req.body as HistoryRequest;

  try {
    // Build cursor if loading older messages
    const cursor = beforeId ? { id: beforeId } : undefined;

    // Fetch in descending order, then reverse for client
    const records = await prisma.message.findMany({
      where: { roomId },
      include: { translations: true },
      orderBy: { timestamp: 'desc' },
      cursor,
      skip: cursor ? 1 : 0,
      take: limit,
    });

    const history = records.reverse();
    return res.status(200).json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    return res.status(500).json({ error: 'Failed to fetch message history' });
  }
}