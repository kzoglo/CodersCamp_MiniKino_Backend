# Multi-stage Dockerfile for development and production
FROM node:20.14.0 AS base
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Development stage
FROM base AS development
# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

EXPOSE 3001

# Use development start command
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
# Install production dependencies only
RUN npm ci --only=production

# Copy source code
COPY . .

# Remove development files to reduce image size
RUN rm -rf test/ .eslintrc.js .prettierrc

EXPOSE 3001

# Use production start command
CMD ["npm", "run", "start:prod"]
