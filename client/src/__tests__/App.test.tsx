/**
 * @vitest-environment happy-dom
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import React from 'react';
import '../test/setup';

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  close: vi.fn(),
};
vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(() => mockSocket),
  };
});

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock global fetch
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/config') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ defaultRoomId: 'room-123', defaultUserId: 'user-456' }),
        });
      }
      if (url.includes('/invites/invalid-token')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Invalid invite link' }),
        });
      }
      if (url.includes('/invites')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: 'test-token', room_id: 'room-123' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'new-invite-token' }),
      });
    });

    // Mock localStorage
    const localStorageMock = (function() {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });
    
    // Mock alert
    global.alert = vi.fn();
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
      configurable: true,
    });
  });

  const waitForLoading = async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  };

  it('renders the chat app header after loading', async () => {
    await waitForLoading();
    const headerElement = screen.getByText(/Chat App/i);
    expect(headerElement).toBeInTheDocument();
  });

  it('allows editing username', async () => {
    await waitForLoading();
    
    const usernameDisplay = screen.getByText(/User:/i);
    fireEvent.click(usernameDisplay);

    const input = screen.getByDisplayValue(/User_/i);
    fireEvent.change(input, { target: { value: 'NewUserName' } });

    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);

    expect(screen.getByText(/User: NewUserName/i)).toBeInTheDocument();
  });

  it('does not save empty username', async () => {
    await waitForLoading();
    
    const usernameDisplay = screen.getByText(/User:/i);
    fireEvent.click(usernameDisplay);

    const input = screen.getByDisplayValue(/User_/i);
    fireEvent.change(input, { target: { value: '   ' } });

    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);

    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  });

  it('allows sending a message', async () => {
    await waitForLoading();

    const input = screen.getByPlaceholderText(/Type a message.../i);
    fireEvent.change(input, { target: { value: 'Hello World' } });

    const sendButton = screen.getByText(/Send/i);
    fireEvent.click(sendButton);

    expect(mockSocket.emit).toHaveBeenCalledWith('send-message', expect.objectContaining({
      content: 'Hello World',
    }));
    expect(input).toHaveValue('');
  });

  it('renders received messages from others', async () => {
    let messageCallback: (msg: any) => void = () => {};
    mockSocket.on.mockImplementation((event, cb) => {
      if (event === 'new-message') messageCallback = cb;
    });

    await waitForLoading();

    // Simulate receiving a message
    const otherMsg = {
      id: 'msg-1',
      room_id: 'room-123',
      user_id: 'other-user',
      username: 'Friend',
      content: 'Hi there!',
    };
    
    await waitFor(() => {
      messageCallback(otherMsg);
    });

    expect(screen.getByText('Friend', { selector: '.user-name' })).toBeInTheDocument();
    expect(screen.getByText(/Hi there!/i)).toBeInTheDocument();
  });

  it('allows creating an invite', async () => {
    await waitForLoading();

    const inviteButton = screen.getByText(/Invite Friends/i);
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/invites'), expect.any(Object));
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('Invite link copied to clipboard!');
    });
  });

  it('handles invite link from URL', async () => {
    delete (window as any).location;
    (window as any).location = new URL('http://localhost/?invite=test-token');

    await waitForLoading();

    expect(global.fetch).toHaveBeenCalledWith('/api/invites/test-token');
    expect(screen.getByText(/Room: room-123/i)).toBeInTheDocument();
  });

  it('handles invalid invite link', async () => {
    delete (window as any).location;
    (window as any).location = new URL('http://localhost/?invite=invalid-token');

    await waitForLoading();

    expect(screen.getByText(/Invalid invite link/i)).toBeInTheDocument();
  });

  it('handles fetch configuration error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load application configuration/i)).toBeInTheDocument();
    });
  });
});
