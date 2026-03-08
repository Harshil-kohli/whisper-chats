# Use official Bun image
FROM oven/bun:1 as base
WORKDIR /app

# Install Node.js for npm
FROM base AS install
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install frontend dependencies
COPY web/package.json web/package-lock.json* web/bun.lock* ./
RUN npm install

# Install server dependencies
COPY web/server/package.json ./server/
RUN cd server && bun install

# Build frontend
FROM base AS build
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

COPY --from=install /app/node_modules node_modules
COPY --from=install /app/server/node_modules server/node_modules
COPY web/ .

# Build the frontend
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production image
FROM base AS release
COPY --from=build /app/server/node_modules server/node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# List files to verify
RUN ls -la /app
RUN ls -la /app/dist || echo "dist folder not found"
RUN ls -la /app/server || echo "server folder not found"

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the server
WORKDIR /app/server
CMD ["bun", "run", "index.ts"]
