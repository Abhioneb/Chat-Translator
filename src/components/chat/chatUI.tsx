// src/components/chat/ChatUI.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import ChatFooter from "@/components/ui/ChatFooter";
import ChatHeader from "@/components/ui/ChatHeader";
import ChatContainer from "@/components/ui/ChatContainer";
import MessageBubble from './MessageBubble';

type Message = {
  id: string;
  original: string;
  translated: string | null;
  sender: 'user' | 'bot';
};

export default function ChatUI({ roomId = 'test-room' }: { roomId?: string }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const socketRef: React.MutableRefObject<Socket | null> = useRef(null);

  // 1) Load initial history
  useEffect(() => {
    async function loadInitialHistory() {
      setIsHistoryLoading(true);
      try {
        const res = await fetch(`/api/messages/${roomId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 50 }),
        });
        const history = await res.json() as { id: string; text: string }[];
        setMessages(history.map(h => ({
          id: h.id,
          original: h.text,
          translated: null,
          sender: 'bot',
        })));
        setHasMoreHistory(history.length === 50);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setIsHistoryLoading(false);
      }
    }
    loadInitialHistory();
  }, [roomId]);

  // 2) Wire up Socket.IO + merge in translations
  useEffect(() => {
    const socket = io({
      path: '/api/socket_io',
      transports: ['websocket'],
      upgrade: false,
    });
    
    socketRef.current = socket;
    socket.emit('join_room', roomId);

    // a) receive the raw message
    socket.on('receive_message', (payload: { id: string; original: string }) => {
    setMessages(msgs => [
      ...msgs,
      {
        id: payload.id,
        original: payload.original, 
        translated: null,
        sender: 'bot',
      },
    ]);
  });

    // b) receive its translation later
    socket.on(
      'receive_translation',
      ({ id, translated }: { id: string; translated: string }) => {
        setMessages(msgs =>
          msgs.map(msg =>
            msg.id === id
              ? { ...msg, translated }
              : msg
          )
        );
      }
    );

    return () => { socket.disconnect(); };
  }, [roomId]);

  // 3) Load more (older) messages
  const loadMoreHistory = async () => {
    if (isHistoryLoading || !hasMoreHistory) return;
    setIsHistoryLoading(true);

    try {
      const oldestId = messages[0]?.id;
      const res = await fetch(`/api/messages/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beforeId: oldestId, limit: 50 }),
      });

      const more = (await res.json()) as { id: string; text: string }[];

      // Build a properly-typed array of Message
      const newMsgs: Message[] = more.map(h => ({
        id: h.id,
        original: h.text,
        translated: null,
        sender: 'bot',
      }));

      // Prepend those to your existing messages
      setMessages(prev => [...newMsgs, ...prev]);
      setHasMoreHistory(more.length === 50);

    } catch (err) {
      console.error('Failed to load more history', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // 4) Send a new message
  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;
    const id = crypto.randomUUID();

    // a) Optimistic UI
    setMessages((msgs) => [
      ...msgs,
      { id, original: input, translated: null, sender: "user" },
    ]);

    // b) Emit with 'to' field on payload 
    socketRef.current.emit("send_message", {
      roomId,
      payload: { id, text: input, to: "fr" },
    });

    setInput('');
  };

  return (
    <ChatContainer>
      <ChatHeader roomName={roomId} />   

      {/* Load more / empty state */}
      <div className="px-4 py-2 text-center">
        {isHistoryLoading
          ? <span>Loading…</span>
          : hasMoreHistory
            ? <button onClick={loadMoreHistory} className="underline">Load more messages</button>
            : <span>No more history</span>}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            sender={msg.sender}
            text={msg.original}
            translated={msg.translated ?? "…translating"}
          />
        ))}
      </div>

      <ChatFooter
        input={input}
        setInput={setInput}
        onSend={handleSend}
      />
    </ChatContainer>
    );
}
