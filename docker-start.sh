#!/bin/bash

# Docker Development Environment Startup Script

echo "🚀 Starting MiniKino Backend Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Cleanup function - runs on script exit
cleanup() {
    echo ""
    echo "🛑 Shutting down MiniKino Backend..."
    echo "📦 Stopping Docker containers..."
    docker compose -f docker-compose.dev.yml down
    echo "✅ All services stopped. Goodbye!"
    exit 0
}

# Trap signals (Ctrl+C, SIGTERM) and run cleanup
trap cleanup SIGINT SIGTERM

echo "📦 Building and starting Docker containers..."

# Start services in detached mode first
docker compose -f docker-compose.dev.yml up --build -d

echo ""
echo "🌐 Services are now available at:"
echo "  - API: http://localhost:3001"
echo "  - MinIO Console: http://localhost:9001 (admin/password)"
echo "  - MongoDB: localhost:27018"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo "📝 Container logs will appear below..."
echo ""

# Now attach to show logs in foreground
docker compose -f docker-compose.dev.yml logs -f