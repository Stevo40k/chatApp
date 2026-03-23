import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import db from './db.js';
import invitesRouter from './invites.js';

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

let defaultRoomId: string;
let defaultUserId: string;

async function seedDefaultData() {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log('Seeding default data...');
      let user = await db('users').where({ username: 'System' }).first();
      if (!user) {
        const [newUser] = await db('users').insert({ username: 'System' }).returning('*');
        user = newUser;
      }
      defaultUserId = user.id;

      let room = await db('rooms').where({ name: 'General' }).first();
      if (!room) {
        const [newRoom] = await db('rooms').insert({ name: 'General', owner_id: defaultUserId }).returning('*');
        room = newRoom;
      }
      defaultRoomId = room.id;
      console.log(`Default Room ID: ${defaultRoomId}`);
      return;
    } catch (error) {
      retries++;
      console.error(`Failed to seed default data (attempt ${retries}/${maxRetries}):`, error);
      if (retries < maxRetries) {
        console.log('Retrying in 2 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
  console.error('Max retries reached. Seeding failed.');
}

// Don't call seedDefaultData here, we'll wait for it in main.ts if possible, 
// or just provide it as an export that can be awaited.
// For now, let's keep it here but export the promise.
const seedPromise = seedDefaultData();

app.get('/api/config', async (req, res) => {
  await seedPromise;
  if (!defaultRoomId || !defaultUserId) {
    return res.status(503).json({ error: 'System is initializing or failed to seed data' });
  }
  res.json({ defaultRoomId, defaultUserId });
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
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    console.log(`Socket ${socket.id} joining room: ${roomId}`);
    socket.join(roomId);
  });

  socket.on('send-message', async (data) => {
    const { room_id, user_id, username, content } = data;
    console.log(`Message received for room ${room_id} from user ${user_id} (${username})`);
    try {
      const [message] = await db('messages')
        .insert({ room_id, user_id, username, content })
        .returning('*');
      
      console.log(`Message saved and emitting: ${message.id}`);
      io.to(room_id).emit('new-message', message);
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

export { app, httpServer, io };
