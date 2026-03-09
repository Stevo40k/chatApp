/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import React from 'react';
import '../test/setup';

// Mock socket.io-client
vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(() => ({
      on: vi.fn(),
      emit: vi.fn(),
      close: vi.fn(),
    })),
  };
});

describe('App Component', () => {
  it('renders the chat app header', () => {
    render(<App />);
    const headerElement = screen.getByText(/Chat App/i);
    expect(headerElement).toBeInTheDocument();
  });

  it('renders the initial room info', () => {
    render(<App />);
    const roomElement = screen.getByText(/Room: default-room/i);
    expect(roomElement).toBeInTheDocument();
  });
});
