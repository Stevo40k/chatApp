import express from 'express';
import crypto from 'crypto';
import db from './db';

const router = express.Router();

export const generateInviteToken = (roomId: string) => {
  return crypto.randomBytes(32).toString('hex');
};

router.post('/rooms/:roomId/invites', async (req, res) => {
  const { roomId } = req.params;
  const { expires_in_hours } = req.body;
  
  const token = generateInviteToken(roomId);
  const expires_at = expires_in_hours 
    ? new Date(Date.now() + expires_in_hours * 60 * 60 * 1000) 
    : null;

  try {
    const [invite] = await db('invites')
      .insert({
        room_id: roomId,
        token,
        expires_at
      })
      .returning('*');
    
    res.status(201).json(invite);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invite' });
  }
});

router.get('/invites/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const invite = await db('invites').where({ token }).first();
    
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (invite.expires_at && new Date() > new Date(invite.expires_at)) {
      return res.status(410).json({ error: 'Invite expired' });
    }

    res.json(invite);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate invite' });
  }
});

export default router;
