// pages/api/socket.ts
import { Server as IOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type { NextApiRequest, NextApiResponse } from 'next';
import { redisClient } from '@/lib/redis';
import { translationQueue } from '@/lib/translationQueue';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

// Extend the type for res.socket.server to include io
interface SocketServer extends HTTPServer {
  io?: IOServer;
}
interface SocketWithServer extends NetSocket {
  server: SocketServer;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sock = res.socket as SocketWithServer;

  // Only initialize once per server process
  if (!sock.server.io) {
    // 1) Use shared Redis client for pub/sub
    const pubClient = redisClient;
    const subClient = pubClient.duplicate();

    // 2) Create Socket.IO server
    const io = new IOServer(sock.server, {
      path: '/api/socket_io',
      cors: { origin: '*' },
    });

    // 3) Attach Redis adapter so multiple instances share events
    io.adapter(createAdapter(pubClient, subClient));

    // 4) Handle client connections
    io.on('connection', (client) => {
      console.log(`Socket connected: ${client.id}`);

      client.on('join_room', (roomId: string) => {
        client.join(roomId);
      });

      client.on(
        'send_message',
        ({ roomId, payload }: { roomId: string; payload: { id: string; text: string; to: string } }) => {
          // a) Broadcast the original immediately (with null translation)
          io.to(roomId).emit('receive_message', {
            ...payload,
            translated: null,
          });

          // b) Enqueue a translation job
          translationQueue.add(payload.id, {
            messageId: payload.id,
            text: payload.text,
            to: payload.to,
            roomId,
          });
        }
      );

      client.on('disconnect', () => {
        console.log(`Socket disconnected: ${client.id}`);
      });
    });

    // 5) Subscribe to completed translations and forward them
    const completionSub = pubClient.duplicate();
    await completionSub.subscribe('translation_completed');
    completionSub.on('message', (_chan, message) => {
      try {
        const { messageId, roomId, translated } = JSON.parse(message);
        io.to(roomId).emit('receive_translation', {
          id: messageId,
          translated,
        });
      } catch (err) {
        console.error('Failed to parse translation_completed:', err);
      }
    });

    sock.server.io = io;
    console.log('Socket.IO + translation pipeline initialized');
  }

  // End the HTTP response; Socket.IO will take over
  res.end();
}
