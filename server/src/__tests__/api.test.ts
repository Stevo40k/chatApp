import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import db from '../db.js';

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

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /api/rooms', () => {
    it('should create a room and return 201', async () => {
      const mockRoom = { id: '1', name: 'Test Room' };
      (db as any).mockImplementationOnce(() => ({
        insert: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRoom]),
      }));

      const res = await request(app)
        .post('/api/rooms')
        .send({ name: 'Test Room' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockRoom);
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/rooms')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should return 500 if DB fails on insert', async () => {
      (db as any).mockImplementationOnce(() => ({
        insert: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error('DB Error')),
      }));

      const res = await request(app)
        .post('/api/rooms')
        .send({ name: 'Fail Room' });

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/rooms/:id', () => {
    it('should return a room if found', async () => {
      const mockRoom = { id: '1', name: 'Test Room' };
      (db as any).mockImplementationOnce(() => ({
        where: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(mockRoom),
      }));

      const res = await request(app).get('/api/rooms/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockRoom);
    });

    it('should return 404 if room not found', async () => {
      (db as any).mockImplementationOnce(() => ({
        where: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(null),
      }));

      const res = await request(app).get('/api/rooms/999');
      expect(res.status).toBe(404);
    });

    it('should return 500 if DB fails on select', async () => {
      (db as any).mockImplementationOnce(() => ({
        where: vi.fn().mockReturnThis(),
        first: vi.fn().mockRejectedValue(new Error('DB Error')),
      }));

      const res = await request(app).get('/api/rooms/1');
      expect(res.status).toBe(500);
    });
  });
});
