# Build stage - Force rebuild v2
FROM node:20-slim AS builder

WORKDIR /app

# Install Bun - v2
RUN apt-get update && apt-get install -y curl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

# Copy and install frontend dependencies
COPY web/package*.json ./
RUN npm ci --only=production

# Copy and install server dependencies  
COPY web/server/package.json ./server/
RUN cd server && bun install --production

# Copy source and build
COPY web/ ./
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build && \
    echo "=== Build complete ===" && \
    ls -la dist/ && \
    echo "=== Dist contents ===" && \
    find dist -type f

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy server and built files
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist

# Verify
RUN echo "=== Final structure ===" && \
    ls -la && \
    ls -la dist/ && \
    ls -la server/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

WORKDIR /app/server
CMD ["bun", "run", "index.ts"]
