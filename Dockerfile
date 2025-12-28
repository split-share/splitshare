FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build-time args for SvelteKit build (schema generation, source maps)
# These are NOT secrets - just needed for the build process
ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ARG BETTER_AUTH_SECRET=placeholder-secret-for-build-min-32-chars
ARG BETTER_AUTH_URL=http://localhost:3000

# Sentry source maps upload (optional)
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN

ENV DATABASE_URL=$DATABASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Runtime environment variables (passed at container start):
# - DATABASE_URL: PostgreSQL connection string
# - BETTER_AUTH_SECRET: Auth secret key
# - BETTER_AUTH_URL: Public URL for auth
# - UPSTASH_REDIS_REST_URL: Upstash Redis URL
# - UPSTASH_REDIS_REST_TOKEN: Upstash Redis token
# - RESEND_API_KEY: Email service API key
# - EMAIL_FROM: Sender email address
# - PUBLIC_APP_URL: Public application URL
# - SENTRY_DSN: Sentry error tracking (optional)

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "build"]
