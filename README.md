# Whisker Anime — Backend
[![CI/CD Pipeline](https://github.com/glrmrissi/whisker-anime-backend-client/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/glrmrissi/whisker-anime-backend-client/actions/workflows/release.yml)

Complete backend for the Whisker Anime platform — an anime catalog and tracking system with advanced authentication, email notifications, and Kitsu API integration.

**Main Technologies**  
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white) 
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) 
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white) 
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white) 
![BullMQ](https://img.shields.io/badge/BullMQ-FF9900?logo=redis&logoColor=white)

---

## Features

### Authentication & Session Management
- User registration and login with **JWT**
- Password hashing with **bcrypt** (salt + pepper)
- Password recovery via email code
- New login detection with security alert email
- IP recognition (stored as hash for privacy)

### Notifications (Whisker Notifier)
- Independent email processing module
- Asynchronous queues with **BullMQ + Redis**
- Transactional emails: new login, unknown IP, and password recovery

### Anime Module
- Full integration with **Kitsu API**
- Optimized endpoints for frontend consumption
- Favorites system
- Nested comments module

### Technical Highlights
- Relational database with **TypeORM**
- Modular and scalable architecture (NestJS)
- Secure credential and IP handling
- Ready for Angular frontend integration

---

## How to Run

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- Redis
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/glrmrissi/whisker-anime-backend-client.git
cd whisker-anime-backend-client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit the .env file with your credentials
```
### Running the application

```bash
Development mode (with hot-reload)
npm run start:dev

# Build for production
npm run build

# Production mode
npm run start:prod
The application will be available at http://localhost:3000.
API Documentation: Access /api (Swagger UI included).
```


### Environment Variables (.env.example)
The .env.example file is already in the repository. Key variables include:

```bash
DATABASE_URL, REDIS_URL
JWT_SECRET, JWT_EXPIRES_IN
EMAIL_HOST, EMAIL_USER, EMAIL_PASS
KITSU_API_BASE_URL
PEPPER_SECRET (for bcrypt salt+pepper)
```


### Related Repositories

- Frontend: whisker-anime-frontend-client
- Notifier Service (Go): whisker-anime-notifier-go


### About the Project
Anime platform backend built with NestJS, PostgreSQL, Redis/BullMQ queues, JWT authentication with IP recognition, bcrypt (salt+pepper), email notifications, and Kitsu API integration.
Developed by: Guilherme Rissi
