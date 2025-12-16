# Blazelog Mobile - React Native Client

## Overview

Mobile client for [blazelog](https://github.com/good-yellow-bee/blazelog) log management system.

## Backend API Summary

| Aspect | Details |
|--------|---------|
| Base URL | `/api/v1` |
| Auth | JWT + Refresh tokens (15min / 7day TTL) |
| Format | JSON REST |
| Docs | OpenAPI 3.0 spec at `blazelog/docs/api/openapi.yaml` |
| Streaming | SSE for real-time logs |

## Available Endpoints

### Auth
- `POST /auth/login` - Get access + refresh tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Revoke tokens

### Logs
- `GET /logs` - Query logs (paginated, filterable)
- `GET /logs/stats` - Log statistics
- `GET /logs/stream` - SSE real-time stream

### Resources
- `GET/POST/PUT/DELETE /alerts` - Alert management
- `GET/POST/PUT/DELETE /projects` - Project management
- `GET /users/me` - Current user profile

## Tech Stack

- **Framework:** React Native
- **State:** TBD (Zustand recommended)
- **API:** Axios or TanStack Query
- **Navigation:** React Navigation

## Type Generation

Generate TypeScript types from OpenAPI spec:

```bash
npx openapi-typescript ../blazelog/docs/api/openapi.yaml -o src/api/types.ts
```

## Key Features to Implement

1. [ ] Authentication flow (login, token refresh, logout)
2. [ ] Log viewer with filtering & search
3. [ ] Real-time log streaming (SSE)
4. [ ] Alert management
5. [ ] Project switching
6. [ ] Push notifications (future)

## Rate Limits

- **Auth endpoints:** 5 req/min per IP
- **Authenticated:** 100 req/min per user

## Notes

- Backend requires CORS headers for mobile web views (not added yet)
- SSE streaming works via standard HTTP, no WebSocket needed
