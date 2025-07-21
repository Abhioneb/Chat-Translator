// src/components/chat/ChatUI.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatContainer } from '@/components/ui/ChatContainer';
import { ChatHeader } from '@/components/ui/ChatHeader';
import { ChatFooter } from '@/components/ui/ChatFooter';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import MessageBubble from './MessageBubble';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

export default function ChatUI({ roomId = 'test-room' }: { roomId?: string }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io({ path: '/api/socket_io', transports: ['websocket'] });
    socketRef.current.emit('join_room', roomId);

    socketRef.current.on('receive_message', (payload: { id: string; text: string }) => {
      setMessages((msgs) => [...msgs, { id: payload.id, text: payload.text, sender: 'bot' }]);
    });

    return () => { socketRef.current?.disconnect(); };
  }, [roomId]);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;
    const id = crypto.randomUUID();
    setMessages((msgs) => [...msgs, { id, text: input, sender: 'user' }]);
    socketRef.current.emit('send_message', { roomId, payload: { id, text: input } });
    setInput('');
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h2 className="text-lg font-semibold">Chat</h2>
        {/* future: language selector */}
      </ChatHeader>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={{
              original: msg.text,
              translated: msg.text,
              sender: msg.sender,
            }}
          />
        ))}
      </div>

      <ChatFooter>
        <Input
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend}>Send</Button>
      </ChatFooter>
    </ChatContainer>
  );
}
