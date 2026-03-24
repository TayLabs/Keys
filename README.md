# TayLabs Keys

A self-hosted API key management service for the TayLabs platform. TayLabs Keys handles the full lifecycle of API keys — creation, rotation, permission scoping, and validation — so that any service in the stack can authenticate machine-to-machine requests without touching JWTs or user sessions.

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Development Setup](#development-setup)
- [Database Migrations](#database-migrations)

---

## Features

- **API key creation and rotation** — generate 64-character hex keys, hashed with Argon2id at rest
- **Permission scoping** — assign fine-grained permission scopes to each key so it can only access what it needs
- **Key verification endpoint** — services call `/keys/verify` to authenticate an inbound API key and check its scopes, with no shared secrets required
- **Service registry** — register external services and their permission definitions; Keys stores them so they can be referenced when assigning scopes to a key
- **TTL-based expiry** — keys automatically expire after a configurable lifetime
- **Access token auth on management routes** — key CRUD operations are protected by JWTs issued by TayLabs Auth
- **Docker-first deployment** — ships with a `Dockerfile` and `docker-compose.yml`

---

## Architecture Overview

TayLabs Keys is a Node.js/Express API backed by PostgreSQL. It sits between the services that *issue* API keys (typically an admin UI or TayLabs Auth) and the services that *consume* them.

```
Admin / Auth  ──(JWT)──▶  Keys API  ──▶  PostgreSQL
                              ▲
Other services  ──(x-api-key)─┘  (verify endpoint — no JWT needed)
```

Key hashes are stored using **Argon2id** with a 64 MB memory cost, making offline brute-force attacks impractical. The raw key is only ever returned at creation time and is never stored in plaintext.

Permission scopes follow the format `service:permission.name`, e.g. `mail:mail.send` or `auth:user.read`. The service and permission definitions are seeded automatically on startup by fetching each TayLabs repo's `taylab.config.yml` from GitHub.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) (v2+)
- A running instance of [TayLabs Auth](https://github.com/TayLabs/Auth) (or its Express SDK) to issue the JWTs used to protect key management routes

---

## Quick Start with Docker

### Development (infrastructure only)

Spin up Postgres and run the Keys API locally.

```bash
# Clone the repository
git clone https://github.com/TayLabs/Keys.git
cd Keys

# Create a .env file (see Configuration section)
cp .example.env .env

# Start the Postgres container
docker compose --profile development up -d

# Install dependencies and run migrations + seed, then start
pnpm install
pnpm dev
```

The API will be available at `http://localhost:7212`.

### Production (fully containerised)

```bash
# Build the image
pnpm docker:build
# or: docker build -t taylabs-keys .

# Start all services
docker compose --profile production up -d
```

The Keys service will be available on port `7212`.

> **Note:** The `production` compose profile builds and runs the Keys API container alongside Postgres. The `development` profile starts Postgres only, leaving the Node process to be run manually.

---

## Configuration

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5212/keys` |
| `ACCESS_TOKEN_SECRET` | ✅ | Must match the secret used by TayLabs Auth to sign access tokens (6–24 characters) |
| `PORT` | | Port the server listens on (default: `7212`) |
| `NODE_ENV` | | `development`, `production`, or `test` (default: `production`) |
| `API_KEY_TTL` | | Lifetime for newly created keys, e.g. `30d` or `120d` (default: `30d`) |
| `SERVICE_NAME` | | Name used when scoping permissions on incoming JWTs (default: `keys`) |

---

## API Reference

All endpoints are prefixed with `/api/v1`.

Management routes (`/services` and most `/keys` operations) require a valid JWT in the `Authorization: Bearer <token>` header, issued by TayLabs Auth. The key verification route is unauthenticated and intended to be called service-to-service.

---

### Services — `/api/v1/services`

Services represent applications or microservices that have permissions defined. Permissions must be registered here before they can be assigned to an API key.

| Method | Path | Required Permission | Description |
|---|---|---|---|
| `GET` | `/services` | `service.read` | List all registered services and their permissions |
| `GET` | `/services/:serviceName` | `service.read` | Get a service and its permissions by name |
| `POST` | `/services/register` | `service.write` | Register a new external service with its permission definitions |
| `PATCH` | `/services/:serviceName` | `service.write` | Update a service's name or permissions |
| `DELETE` | `/services/:serviceName` | `service.write` | Remove a service and its associated permissions |

**Register a service — request body**

```json
{
  "service": "my-service",
  "permissions": [
    { "key": "data.read", "description": "Read data from the service" },
    { "key": "data.write", "description": "Write data to the service" }
  ]
}
```

---

### Keys — `/api/v1/keys`

| Method | Path | Required Permission | Description |
|---|---|---|---|
| `GET` | `/keys` | `key.read` | List all API keys (raw key values are never returned) |
| `GET` | `/keys/:keyId` | `key.read` | Get a single key by ID |
| `POST` | `/keys` | `key.write` | Create a new API key — the raw key is only returned in this response |
| `PATCH` | `/keys/:keyId` | `key.write` | Update a key's name or permission scopes |
| `DELETE` | `/keys/:keyId` | `key.write` | Revoke and delete an API key |
| `POST` | `/keys/verify` | None | Verify an API key and check it has the required scopes |

**Create a key — request body**

```json
{
  "name": "my-service-prod",
  "permissions": [
    "permission-uuid-1",
    "permission-uuid-2"
  ]
}
```

**Create a key — response**

```json
{
  "success": true,
  "data": {
    "key": {
      "id": "uuid",
      "name": "my-service-prod",
      "keyLastFour": "a1b2",
      "expiresAt": "2026-01-01T00:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "apiKey": "the-raw-64-character-hex-key-only-shown-once"
  }
}
```

**Verify a key — request body**

```json
{
  "key": "the-64-character-hex-key",
  "scopes": ["mail:mail.send", "auth:user.read"]
}
```

Returns `200 OK` if the key is valid, not expired, and has all the requested scopes. Returns `400` for an invalid key or `403` if the key lacks the required scopes.

---

## Development Setup

### Requirements

- Node.js
- Docker (for Postgres)
- A running [TayLabs Auth](https://github.com/TayLabs/Auth) instance to obtain JWTs for the management routes (not required to run the service, keys just can't be added via the admin api routes)

### Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Start Postgres
docker compose --profile development up -d

# 3. Create a .env file and set the required variables
# DATABASE_URL and ACCESS_TOKEN_SECRET are the minimum needed

# 4. Run in watch mode
pnpm watch
```

### Available scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start the server once in development mode |
| `pnpm watch` | Start with file-watching and auto-restart |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run the compiled build |
| `pnpm db:init` | Generate and apply all pending migrations |
| `pnpm docker:build` | Build the `taylabs-keys` Docker image |

---

## Database Migrations

Migrations are managed with [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) and run automatically on server startup.

To manually generate and apply migrations during development:

```bash
pnpm db:init
```

On first boot the server runs a **seed** function that fetches each TayLabs repo's `taylab.config.yml` from GitHub and registers the declared services and their `api-key`-scoped permissions. This keeps the Keys service's permission registry in sync with the rest of the platform automatically.

---

## License

This project is licensed under the **GNU Affero General Public License v3.0**. See [LICENSE](./LICENSE) for details.

In short: if you run a modified version of this software on a network server, you must make the source code of your modifications available to users of that service.
