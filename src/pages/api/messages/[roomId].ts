// pages/api/messages/[roomId].ts
import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roomId } = req.query;

  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

    // fetch messages for this room
    const messages = await prisma.message.findMany({
      where: { roomId: String(roomId) },
      include: { sender: true, translations: true },
      orderBy: { timestamp: "asc" },
    });

    return res.status(200).json(messages);
  }

  // later you can add POST here if you want to persist messages via REST
  return res.status(405).json({ error: "Method Not Allowed" });
}
