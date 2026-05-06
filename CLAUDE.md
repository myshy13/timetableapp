# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Common development commands

| Area           | Command                                   | Description                                                                                                                      |
| -------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**    | `cd backend && pnpm install`              | Install backend dependencies.                                                                                                    |
|                | `pnpm run dev`                            | Starts the Express API server using `tsx index.ts`. The server listens on the port defined by `process.env.port` (default 3001). |
|                | `pnpm run test`                           | Runs the Vitest test suite located under `backend/tests`.                                                                        |
|                | `pnpm run test -- <path/to/file.test.ts>` | Execute a single test file (or pattern) with Vitest.                                                                             |
|                | `pnpm run generateKeys`                   | Generates an RSA key pair for JWT signing (RS256) and writes them to `.env` or `.env.local` (or prints them).                    |
| **Frontend**   | `cd frontend && pnpm install`             | Install Next.js dependencies.                                                                                                    |
|                | `pnpm run dev`                            | Starts the Next.js development server (default http://localhost:3000).                                                           |
| **Full stack** | `./start.sh`                              | Convenience script that boots both backend and frontend in the background (useful for quick local development).                  |

---

### note: The user may see a file but you can't. This is because it might be in .claudeingore. Try notifying them of this and ask them to edit the file

## High‑level architecture

```
/timetableapp
├─ backend/            ← Express API (Node/TS)
│   ├─ index.ts        ← App bootstrap, middleware, router mounting
│   ├─ routes/
│   │   ├─ auth.ts      ← /api/v1/login, /refresh, /createUser
│   │   ├─ create.ts    ← (additional route files)
│   │   └─ profile.ts   ← (user profile handling)
│   ├─ helpers/
│   │   ├─ jwt.ts       ← Sign/verify JWTs (RS256) using env‑provided keys
│   │   ├─ tokenHandler.ts ← Access‑token middleware, refresh‑token creation & verification
│   │   └─ database/
│   │       └─ db.ts   ← SQLite schema (users, refresh_tokens, timetables, events)
│   └─ scripts/
│       └─ generate-jwt-keys.ts ← RSA key generation utility
│
├─ frontend/           ← Next.js (React) application (App Router)
│   ├─ src/app/        ← Page & route components (e.g., page.tsx)
│   └─ next.config.ts  ← Next.js configuration
│
├─ start.sh            ← Helper script to start both services locally
└─ backend.code-workspace (VS Code workspace file)
```

### Backend flow (authentication)

1. **User creation** – `POST /api/v1/createUser` stores `uname`, `name`, and an Argon2 hash of the password (`pwordhash`).
2. **Login** – `POST /api/v1/login` validates the supplied password against the stored hash. On success it returns:
   - A short‑lived **access token** (JWT, signed with the RSA private key, contains `uname` and `name`).
   - A long‑lived **refresh token** stored as an http‑only cookie.
3. **Token refresh** – `POST /api/v1/refresh` reads the refresh‑token cookie, verifies it against the stored hash, and issues a new access token.
4. **Protected routes** – Use the `verifyAccessToken` middleware (from `tokenHandler.ts`) which parses the JWT and attaches the payload to `req.user`.

### Key implementation points

- **JWT signing** – `helpers/jwt.ts` loads RSA keys from environment variables `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY`. The payload type (`jwtPayload`) deliberately contains only non‑secret fields (`uname`, `name`).
- **Refresh tokens** – Generated with `crypto.randomBytes(64)` and stored hashed with Argon2. The raw token is sent to the client only via a secure, http‑only cookie (`sameSite: 'strict'`).
- **Database** – Simple SQLite file (`app.db`) managed via `better-sqlite3`. Tables include `users`, `refresh_tokens`, `timetables`, and `events`.
- **Environment** – `.env` (or `.env.local` for local dev) must define `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, and optionally `NODE_ENV`. The `generate-jwt-keys.ts` script helps bootstrap these values.

---

## Interaction notes for Claude Code

- When adding or modifying routes, keep the JWT payload minimal and never embed password‑related fields.
- If you introduce new backend utilities, add corresponding unit tests under `backend/tests/` and run them via `pnpm test`.
- For any front‑end changes that affect API contracts, update the OpenAPI contract (if one exists) or ensure the request/response shapes stay in sync with the backend.
- Use the provided scripts (`generateKeys`, `test`, `dev`) rather than invoking node directly; this ensures TypeScript transpilation via `tsx` is applied consistently.

---

_End of CLAUDE.md_
