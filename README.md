Whisker Anime — Backend
Backend of the Whisker platform, an anime catalog and tracking system with full authentication, email notifications, and Kitsu API integration.

- NestJS + TypeScript
- PostgreSQL + TypeORM
- Redis + BullMQ — asynchronous job queues
- Nodemailer — transactional email delivery
- Bcrypt — password hashing with salt + pepper
- Kitsu API — anime data source

## Features
### Authentication & Session:

User registration and login with JWT
Password hashing with bcrypt (salt + pepper)
Password recovery via code sent to email
New login detection: alert email sent to the user
IP recognition — IPs are stored as hashes to preserve user privacy
If a login occurs from an unfamiliar IP, the user is notified

### Notifications (Whisker Notifier):

Standalone email processing module
Asynchronous queue with Bull + Redis
Emails for: new login, unknown IP detected, password recovery

### Animes:

Integration with the Kitsu API
Endpoints ready for frontend consumption
Favorite animes module
Comments module

### Related repositories:
whisker-anime-frontend-client
whisker-anime-notifier
