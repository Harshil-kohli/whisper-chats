# Production Dockerfile for Railway
FROM node:20-slim AS builder

WORKDIR /app

# Install Bun
RUN apt-get update && apt-get install -y curl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

# Copy and install frontend dependencies
COPY web/package*.json ./
RUN npm ci

# Copy and install server dependencies  
COPY web/server/package.json ./server/
RUN cd server && bun install

# Copy source and build
COPY web/ ./

# Build arguments
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL

# Build frontend
RUN npm run build && \
    echo "=== Build complete ===" && \
    ls -la dist/ && \
    echo "=== Dist contents ===" && \
    find dist -type f | head -20

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy server and built files
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist

# Verify files exist
RUN echo "=== Final structure ===" && \
    ls -la && \
    echo "=== Dist folder ===" && \
    ls -la dist/ && \
    echo "=== Server folder ===" && \
    ls -la server/

# Environment
ENV NODE_ENV=production

# Expose port (Railway will set PORT env var)
EXPOSE 3000

WORKDIR /app/server
CMD ["bun", "run", "index.ts"]
