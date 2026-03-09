import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import db from '../db';

// Mock DB
vi.mock('../db', () => {
  return {
    default: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      first: vi.fn(),
    })),
  };
});

describe('Invites API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/rooms/:roomId/invites', () => {
    it('should create an invite', async () => {
      const mockInvite = { id: '1', room_id: 'room-1', token: 'token-123' };
      (db as any).mockImplementationOnce(() => ({
        insert: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockInvite]),
      }));

      const res = await request(app)
        .post('/api/rooms/room-1/invites')
        .send({ expires_in_hours: 24 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockInvite);
    });
  });

  describe('GET /api/invites/:token', () => {
    it('should return invite if found and not expired', async () => {
      const mockInvite = { 
        id: '1', 
        token: 'token-123', 
        expires_at: new Date(Date.now() + 10000).toISOString() 
      };
      (db as any).mockImplementationOnce(() => ({
        where: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(mockInvite),
      }));

      const res = await request(app).get('/api/invites/token-123');
      expect(res.status).toBe(200);
      expect(res.body.token).toBe('token-123');
    });

    it('should return 404 if invite not found', async () => {
      (db as any).mockImplementationOnce(() => ({
        where: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(null),
      }));

      const res = await request(app).get('/api/invites/non-existent');
      expect(res.status).toBe(404);
    });

    it('should return 410 if invite expired', async () => {
      const mockInvite = { 
        id: '1', 
        token: 'token-123', 
        expires_at: new Date(Date.now() - 10000).toISOString() 
      };
      (db as any).mockImplementationOnce(() => ({
        where: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(mockInvite),
      }));

      const res = await request(app).get('/api/invites/token-123');
      expect(res.status).toBe(410);
    });

    it('should return 500 if DB fails on GET', async () => {
      (db as any).mockImplementationOnce(() => ({
        where: vi.fn().mockReturnThis(),
        first: vi.fn().mockRejectedValue(new Error('DB Error')),
      }));

      const res = await request(app).get('/api/invites/token-123');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/rooms/:roomId/invites error path', () => {
    it('should return 500 if DB fails on POST', async () => {
      (db as any).mockImplementationOnce(() => ({
        insert: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error('DB Error')),
      }));

      const res = await request(app).post('/api/rooms/room-1/invites').send({});
      expect(res.status).toBe(500);
    });
  });
});
