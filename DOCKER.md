# Docker Setup Guide

This guide explains how to run SplitShare using Docker Compose for local development.

## Quick Start

### Automated Setup (Recommended)

Run the automated setup script:

```bash
./docker-setup.sh
```

This script will:

- Create `.env` file from `.env.example`
- Generate a secure authentication secret
- Start all Docker services
- Wait for services to be healthy
- Install Node.js dependencies
- Run database migrations

After the script completes, start the development server:

```bash
npm run dev
```

### Manual Setup

If you prefer to set up manually:

1. **Copy environment variables**:

   ```bash
   cp .env.example .env
   ```

2. **Generate authentication secret**:

   ```bash
   openssl rand -base64 32
   ```

   Copy the output and update `BETTER_AUTH_SECRET` in your `.env` file.

3. **Start all services**:

   ```bash
   docker compose up -d
   ```

4. **Run database migrations**:

   ```bash
   npm install
   npm run db:push
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

### Access Points

Once everything is running:

- Web app: http://localhost:5173
- Email inbox: http://localhost:8025

## Available Services

### Core Services (Always Running)

#### PostgreSQL Database

- **Port**: 5432
- **Database**: splitshare
- **User**: splitshare
- **Password**: splitshare_dev_password
- **Connection String**: `postgresql://splitshare:splitshare_dev_password@localhost:5432/splitshare`

#### Redis (Rate Limiting)

- **Port**: 6379
- **Password**: redis_dev_password
- **Upstash Proxy**: http://localhost:8079 (HTTP interface for Upstash SDK)

#### Mailpit (Email Testing)

- **SMTP Port**: 1025
- **Web UI**: http://localhost:8025
- **Purpose**: Captures all outgoing emails for testing

### Optional Services (With Profiles)

#### pgAdmin (Database Management)

Start with: `docker compose --profile tools up -d`

- **Port**: 5050
- **URL**: http://localhost:5050
- **Email**: admin@admin.com
- **Password**: admin

#### Redis Commander (Redis Management)

Start with: `docker compose --profile tools up -d`

- **Port**: 8081
- **URL**: http://localhost:8081

## Docker Commands

### Basic Operations

```bash
# Start all core services
docker compose up -d

# Start with management tools (pgAdmin, Redis Commander)
docker compose --profile tools up -d

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f postgres
docker compose logs -f redis

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes all data)
docker compose down -v
```

### Service Management

```bash
# Restart a specific service
docker compose restart postgres

# Rebuild a service
docker compose up -d --build postgres

# View running containers
docker compose ps

# Execute commands in a container
docker compose exec postgres psql -U splitshare -d splitshare
```

## Database Operations

### Run Migrations

```bash
npm run db:push
```

### Access Database CLI

```bash
docker compose exec postgres psql -U splitshare -d splitshare
```

### Backup Database

```bash
docker compose exec postgres pg_dump -U splitshare splitshare > backup.sql
```

### Restore Database

```bash
docker compose exec -T postgres psql -U splitshare -d splitshare < backup.sql
```

## Mailpit Email Testing

All emails sent by the application are captured by Mailpit and displayed in the web interface.

### Accessing Mailpit

1. Open http://localhost:8025
2. View all captured emails
3. Test email verification, password reset, etc.

## Troubleshooting

### Services Not Starting

Check if ports are already in use:

```bash
# Check PostgreSQL port
lsof -i :5432

# Check Redis port
lsof -i :6379
```

### Database Connection Errors

Verify PostgreSQL is running:

```bash
docker compose ps postgres
docker compose logs postgres
```

Test connection:

```bash
docker compose exec postgres pg_isready -U splitshare
```

### Redis Connection Errors

Verify Redis and Upstash proxy are running:

```bash
docker compose ps redis upstash-proxy
docker compose logs upstash-proxy
```

Test Redis connection:

```bash
docker compose exec redis redis-cli -a redis_dev_password ping
```

## Production Considerations

When moving to production:

1. **Database**: Use managed PostgreSQL (AWS RDS, Digital Ocean, etc.)
2. **Redis**: Use Upstash Redis cloud service
3. **Email**: Use Resend, SendGrid, or similar service
4. **Error Monitoring**: Use Sentry.io cloud service (https://sentry.io)

Update `.env` with production values:

```env
DATABASE_URL=postgresql://user:pass@production-host:5432/splitshare
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
RESEND_API_KEY=re_your_api_key
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

## Network Configuration

All services run on a shared network called `splitshare-network`. This allows services to communicate with each other using service names as hostnames.

Example: The upstash-proxy can reach Redis at `redis:6379` instead of `localhost:6379`.

## Data Persistence

Data is persisted in Docker volumes:

- `postgres_data`: PostgreSQL database files
- `redis_data`: Redis persistence files
- `pgadmin_data`: pgAdmin configuration (if using tools profile)

To reset all data:

```bash
docker compose down -v
docker compose up -d
npm run db:push
```
