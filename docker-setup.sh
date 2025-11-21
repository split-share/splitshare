#!/bin/bash

# SplitShare Docker Setup Script
# This script automates the initial Docker setup for development

set -e

echo "🚀 SplitShare Docker Setup"
echo "=========================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not available"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✓ Docker is installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env

    # Generate a secure secret for Better Auth
    if command -v openssl &> /dev/null; then
        SECRET=$(openssl rand -base64 32)
        # Replace the placeholder with actual secret (works on both macOS and Linux)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32|BETTER_AUTH_SECRET=$SECRET|g" .env
        else
            sed -i "s|BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32|BETTER_AUTH_SECRET=$SECRET|g" .env
        fi
        echo "✓ Generated secure BETTER_AUTH_SECRET"
    else
        echo "⚠️  OpenSSL not found. Please manually set BETTER_AUTH_SECRET in .env"
    fi
else
    echo "✓ .env file already exists"
fi

echo ""
echo "🐳 Starting Docker services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check if PostgreSQL is ready
echo "Checking PostgreSQL..."
until docker compose exec -T postgres pg_isready -U splitshare &> /dev/null; do
    echo "  Waiting for PostgreSQL to be ready..."
    sleep 2
done
echo "✓ PostgreSQL is ready"

# Check if Redis is ready
echo "Checking Redis..."
until docker compose exec -T redis redis-cli -a redis_dev_password ping &> /dev/null; do
    echo "  Waiting for Redis to be ready..."
    sleep 2
done
echo "✓ Redis is ready"

echo ""
echo "📦 Installing Node.js dependencies..."
npm install

echo ""
echo "🗄️  Running database migrations..."
npm run db:push

echo ""
echo "✅ Setup complete!"
echo ""
echo "Available services:"
echo "  📊 PostgreSQL: localhost:5432"
echo "  🔴 Redis:      localhost:6379"
echo "  📧 Mailpit:    http://localhost:8025"
echo ""
echo "Optional services (start manually):"
echo "  🛠️  Management tools:  docker compose --profile tools up -d"
echo "     • pgAdmin:         http://localhost:5050"
echo "     • Redis Commander: http://localhost:8081"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "View logs: docker compose logs -f"
echo "Stop services: docker compose down"
