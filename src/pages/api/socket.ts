import { Server as IOServer } from 'socket.io';
import { createAdapter }    from '@socket.io/redis-adapter';
import { getToken }         from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { redisClient }      from '@/lib/redis';
import { translationQueue } from '@/lib/translationQueue';
import { persistenceQueue } from '@/lib/persistenceQueue';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket }  from 'net';

interface SocketServer extends HTTPServer { io?: IOServer }
interface SocketWithServer extends NetSocket { server: SocketServer }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sock = res.socket as SocketWithServer;

  if (!sock.server.io) {
    const pubClient = redisClient;
    const subClient = pubClient.duplicate();

    const io = new IOServer(sock.server, {
      path: '/api/socket_io',
      cors: { origin: '*' },
    });

    // 1) Authenticate every socket connection
    io.use(async (client, next) => {
      const token = await getToken({
        req: client.request as NextApiRequest,
        secret: process.env.NEXTAUTH_SECRET!,
      });
      if (!token?.sub) {
        return next(new Error('Authentication error'));
      }
      client.data.userId = token.sub; // stash the user ID
      next();
    });

    // 2) Scale-out adapter
    io.adapter(createAdapter(pubClient, subClient));

    // 3) Handle connections
    io.on('connection', (client) => {
      client.on('join_room', (roomId: string) => {
        client.join(roomId);
      });

      client.on(
        'send_message',
        ({
          roomId,
          payload,         
        }: {
          roomId: string;
          payload: { id: string; text: string; to: string };
        }) => {
          const senderId = client.data.userId as string;

          // a) Broadcast original
          io.to(roomId).emit('receive_message', {
            id:         payload.id,
            text:       payload.text,
            to:         payload.to,
            senderId,                
            translated: null,
          });

          // b) Enqueue translation
          translationQueue.add(payload.id, {
            messageId: payload.id,
            text:      payload.text,
            to:        payload.to,
            roomId,
          });

          // c) Enqueue persistence
          persistenceQueue.add(payload.id, {
            messageId:    payload.id,
            roomId,
            senderId,
            textOriginal: payload.text,
            langOriginal: payload.to,
            timestamp:    new Date().toISOString(),
          });
        }
      );
    });

    // 4) Forward completed translations
    const completionSub = pubClient.duplicate();
    await completionSub.subscribe('translation_completed');
    completionSub.on('message', (_chan, msg) => {
      const { messageId, roomId, translated } = JSON.parse(msg);
      io.to(roomId).emit('receive_translation', { id: messageId, translated });
    });

    sock.server.io = io;
    console.log('Socket.IO + auth + queues initialized');
  }

  res.end();
}
