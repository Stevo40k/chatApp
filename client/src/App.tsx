import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at?: string;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('User_' + Math.floor(Math.random() * 1000));
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        
        const params = new URLSearchParams(window.location.search);
        const token = params.get('invite');
        if (token) {
          await validateInvite(token);
        } else {
          setRoomId(data.defaultRoomId);
        }
        setUserId(data.defaultUserId);
      } catch (err) {
        setError('Failed to load application configuration');
      }
    };

    fetchConfig();
  }, []);

  const validateInvite = async (token: string) => {
    try {
      const res = await fetch(`/api/invites/${token}`);
      if (res.ok) {
        const invite = await res.json();
        setRoomId(invite.room_id);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Invalid invite link');
      }
    } catch (err) {
      setError('Failed to validate invite');
    }
  };

  useEffect(() => {
    if (!roomId) return;

    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('join-room', roomId);

    newSocket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.close();
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && input.trim() && roomId && userId) {
      socket.emit('send-message', {
        room_id: roomId,
        user_id: userId,
        content: input,
      });
      setInput('');
    }
  };

  const createInvite = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expires_in_hours: 24 }),
      });
      if (res.ok) {
        const invite = await res.json();
        const url = `${window.location.origin}?invite=${invite.token}`;
        setInviteToken(url);
        navigator.clipboard.writeText(url);
        alert('Invite link copied to clipboard!');
      } else {
        alert('Failed to create invite');
      }
    } catch (err) {
      alert('Error creating invite');
    }
  };

  if (!roomId) return <div>Loading...</div>;

  return (
    <div className="chat-app">
      <header>
        <h1>Chat App</h1>
        <div className="room-info">
          Room: {roomId.substring(0, 8)}... | User: {username}
          <button onClick={createInvite} className="invite-btn">Invite Friends</button>
        </div>
        {error && <div className="error-banner">{error}</div>}
        {inviteToken && <div className="invite-success">Link: {inviteToken}</div>}
      </header>
      
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.user_id === userId ? 'own' : ''}`}>
            <span className="user">{msg.user_id === userId ? 'Me' : 'Others'}:</span>
            <span className="content">{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-area">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
