# Business Design Document: Simple Chat App

## Project Overview
A secure, real-time chat application designed for simplicity and ease of use. The tool allows users to communicate instantly and join conversations via secure invite links.

## Target Audience
Users seeking a lightweight, private, and straightforward messaging solution without the bloat of major platforms.

## Core Features
1.  **Real-time Messaging:** Instant message delivery using WebSockets.
2.  **Secure Invites:** Encrypted or unique token-based invite links to join specific chat rooms.
3.  **Clean UI:** Minimalist design focusing on readability and intuitive navigation.
4.  **Persistent Storage:** All messages and chat history stored in a PostgreSQL database.

## Technical Architecture
-   **Backend:** Node.js with TypeScript.
-   **Real-time:** WebSockets (Socket.io or native `ws`).
-   **Database:** PostgreSQL for persistent data.
-   **Containerization:** Docker for local development and consistent environments.
-   **Frontend:** Vite with React and TypeScript.
-   **Testing:** Vitest for unit and integration tests (80% coverage mandate), Playwright for E2E.

## Security Considerations
-   Secure handling of invite tokens.
-   Data validation and sanitization.
-   Environment variable management for sensitive credentials.

## Success Metrics
-   80% unit test coverage (Mandated by `GEMINI.md`).
-   Sub-second message latency.
-   Successful containerized deployment via Docker Compose.
