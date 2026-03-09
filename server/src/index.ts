import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import db from './db';
import invitesRouter from './invites';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Adjust for production
  },
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', invitesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Basic Room API
app.post('/api/rooms', async (req, res) => {
  const { name, owner_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const [room] = await db('rooms')
      .insert({ name, owner_id })
      .returning('*');
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.get('/api/rooms/:id', async (req, res) => {
  try {
    const room = await db('rooms').where({ id: req.params.id }).first();
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Socket.io logic
io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send-message', async (data) => {
    const { room_id, user_id, content } = data;
    try {
      const [message] = await db('messages')
        .insert({ room_id, user_id, content })
        .returning('*');
      
      io.to(room_id).emit('new-message', message);
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  });
});

export { app, httpServer, io };
