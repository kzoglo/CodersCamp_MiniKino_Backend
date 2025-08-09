#!/bin/bash

# Complete Test Runner Script - Docker Edition
# This script runs tests inside Docker containers

echo "🧪 Running MiniKino Backend Tests (Docker)..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up test environment..."
    docker compose -f docker-compose.test.yml down > /dev/null 2>&1
    echo "✅ Cleanup complete!"
}

# Trap signals to ensure cleanup happens
trap cleanup EXIT

echo "📦 Building and starting test environment..."

# Check if a specific test file was provided
TEST_FILE=${1}

# Check if a specific test file was provided
if [ -n "$1" ]; then
    echo "🔍 Running specific test file: $1"
    # Pass the test file as an environment variable to docker-compose
    export TEST_FILE="$1"
else
    echo "🔍 Running all tests"
    # Explicitly unset TEST_FILE to ensure it's not set
    unset TEST_FILE
fi

# Run tests using docker-compose
# This will build the test image, start dependencies, and run tests
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
