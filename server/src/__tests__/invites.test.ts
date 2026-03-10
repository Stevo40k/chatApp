import { describe, it, expect } from 'vitest';
import { generateInviteToken } from '../invites.js';

describe('Invite logic', () => {
  it('should generate a 64-character hex string', () => {
    const token = generateInviteToken('room-123');
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });
});
