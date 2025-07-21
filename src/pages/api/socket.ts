import { Server as IOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

// Extend the type for res.socket.server to include io
interface SocketServer extends HTTPServer {
  io?: IOServer;
}
interface SocketWithServer extends NetSocket {
  server: SocketServer;
}

let io: IOServer;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket as SocketWithServer;
  if (!socket.server.io) {
    // 1) create Socket.IO server
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      res.status(500).json({ error: 'REDIS_URL environment variable not set' });
      return;
    }
    const pubClient = new Redis(redisUrl);
    const subClient = pubClient.duplicate();

    io = new IOServer(socket.server, {
      path: '/api/socket_io',
      cors: { origin: '*' },
    });

    // 2) attach Redis adapter for scaling
    io.adapter(createAdapter(pubClient, subClient));

    // 3) on connection
    io.on('connection', (socket) => {
      console.log(`⚡️ Socket connected: ${socket.id}`);

      // join a room (e.g. user’s personal room or chat room)
      socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
      });

      // handle incoming chat
      socket.on('send_message', ({ roomId, payload }) => {
        // broadcast to everyone in room (including sender)
        io.to(roomId).emit('receive_message', payload);
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    socket.server.io = io;
  }

  // Always return 200 on this endpoint—Socket.IO hooks onto it
  res.end();
}
