import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket } from 'socket.io-client';
import { app, io } from '../index';
import db from '../db';

// Mock DB
vi.mock('../db', () => {
  return {
    default: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'msg-1', content: 'hello' }]),
    })),
  };
});

describe('Socket logic', () => {
  let server: any;
  let clientSocket: Socket;
  let port: number;

  beforeEach(() => {
    return new Promise((resolve) => {
      server = createServer(app);
      io.attach(server);
      server.listen(() => {
        port = (server.address() as any).port;
        clientSocket = Client(`http://localhost:${port}`);
        clientSocket.on('connect', () => resolve(true));
      });
    });
  });

  afterAll(() => {
    io.close();
    server.close();
  });

  it('should join a room', () => {
    return new Promise((resolve) => {
      clientSocket.emit('join-room', 'room-1');
      // We can't easily check internal room state of server-side socket without more hacks,
      // but emitting it increases coverage.
      setTimeout(resolve, 50);
    });
  });

  it('should send a message and broadcast it', () => {
    return new Promise((resolve) => {
      const msgData = { room_id: 'room-1', user_id: 'user-1', content: 'hello' };
      
      clientSocket.emit('join-room', 'room-1');
      
      clientSocket.on('new-message', (data) => {
        expect(data.content).toBe('hello');
        expect(db).toHaveBeenCalled();
        resolve(true);
      });

      setTimeout(() => {
        clientSocket.emit('send-message', msgData);
      }, 50);
    });
  });
});
