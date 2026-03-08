# Use official Bun image
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json package-lock.json* bun.lock* /temp/dev/
RUN cd /temp/dev && npm install

# Copy server dependencies
COPY server/package.json /temp/dev/server/
RUN cd /temp/dev/server && bun install

# Build frontend
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Build the frontend with Railway env vars
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
ENV VITE_API_URL=${VITE_API_URL}

# Log build args for debugging
RUN echo "Building with VITE_API_URL: $VITE_API_URL"

# Clean any previous builds and build fresh
RUN rm -rf dist && npm run build

# Verify build output
RUN echo "=== Build complete ===" && \
    ls -la dist/ && \
    echo "=== Assets folder ===" && \
    ls -la dist/assets/ && \
    echo "=== Index.html content (first 50 lines) ===" && \
    head -50 dist/index.html

# Production image
FROM base AS release
COPY --from=install /temp/dev/server/node_modules server/node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production

# Verify files in final image
RUN echo "=== Final dist folder ===" && \
    ls -la dist/ && \
    echo "=== Final assets folder ===" && \
    ls -la dist/assets/

# Start the server from app root so it can find dist folder
WORKDIR /app
CMD ["bun", "run", "server/index.ts"]
