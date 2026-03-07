# Use official Bun image
FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY server/package.json server/bun.lock* ./server/

# Install dependencies
RUN bun install --frozen-lockfile
RUN cd server && bun install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN bun run build

# Expose port
EXPOSE 3000

# Set environment
ENV PORT=3000
ENV NODE_ENV=production

# Start server (which serves the built frontend)
WORKDIR /app/server
CMD ["bun", "index.ts"]
