# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/frontend/ ./

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Install serve to run the application
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist/frontend/browser", "-l", "tcp://0.0.0.0:3000"]
