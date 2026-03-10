# Whisker Anime — Backend
[![CI/CD Pipeline](https://github.com/glrmrissi/whisker-anime-backend-client/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/glrmrissi/whisker-anime-backend-client/actions/workflows/release.yml)

Complete backend for the Whisker Anime platform — an anime catalog and tracking system with advanced authentication, email notifications, and Kitsu API integration.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

---

## Tech Stack

- **NestJS 11** — modular framework with CQRS pattern (`@nestjs/cqrs`)
- **TypeScript** — compiled with **SWC** for faster builds
- **PostgreSQL 14** — relational database managed by **TypeORM** (with migration support)
- **Redis** + **BullMQ** — async job queue for email notifications
- **Docker** + **Docker Compose** — multi-stage image (`node:20-alpine`), orchestrates app, Postgres, and Redis
- **pnpm** — package manager
- **Swagger** (`@nestjs/swagger`) — interactive API docs available at `/api-docs`
- **JWT** — cookie-based authentication (`x_access_token`)
- **bcrypt** — password hashing with salt + pepper
- **Throttler** (`@nestjs/throttler`) — rate limiting
- **Sharp** — server-side image processing for avatar uploads
- **class-validator** + **class-transformer** — request validation via global `ValidationPipe`
- **Semantic Release** — automated versioning and changelogs from Conventional Commits
- **GitHub Actions** — CI/CD pipeline on push to `main`

---

## Features

### Authentication & Session Management
- User registration and login with **JWT** stored in HTTP-only cookies
- Password hashing with **bcrypt** (salt + pepper)
- Password recovery via email code
- New login detection with security alert email
- IP recognition (stored as hash for privacy)

### Notifications
- Asynchronous email processing via **BullMQ + Redis** queues
- Transactional emails: new login, unknown IP, password recovery
- Consumed by the external **Go worker** (`whisker-anime-notifier-go`)

### Anime Module
- Full integration with the **Kitsu API**
- Favorites, watch history, and nested comments
- Personalized anime recommendations

### Technical Highlights
- CQRS pattern for clean command/query separation
- Global performance logging interceptor
- Static file serving for user-uploaded content (`/uploads/`)
- Configurable CORS via environment variable

---

## API Documentation

Swagger UI is available at:

```
http://localhost:3001/api-docs
```

Cookie authentication (`x_access_token`) is pre-configured in the Swagger interface.

---

## Running with Docker

```bash
cp .env.example .env
# Fill in your credentials in .env

docker compose up --build
```

The API will be available at `http://localhost:8000`.

---

## Running Locally

**Prerequisites:** Node.js 20+, PostgreSQL, Redis, pnpm

```bash
pnpm install
cp .env.example .env
pnpm run start:dev
```

**Database migrations:**

```bash
pnpm run migration:run
```

---

## Related Repositories

- Frontend: https://github.com/glrmrissi/whisker-anime-frontend-client
- Notifier Worker (Go): https://github.com/glrmrissi/whisker-anime-notifier-go
- Recommender (Go): https://github.com/glrmrissi/whisker-anime-recommender

---

Developed by [Guilherme Rissi](https://github.com/glrmrissi)
