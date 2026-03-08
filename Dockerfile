# Use official Bun image
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY web/package.json web/package-lock.json* web/bun.lock* ./
RUN npm install

# Copy server dependencies
COPY web/server/package.json ./server/
RUN cd server && bun install

# Build frontend
FROM base AS build
COPY --from=install /app/node_modules node_modules
COPY web/ .

# Build the frontend
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production image
FROM base AS release
COPY --from=install /app/server/node_modules server/node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the server
WORKDIR /app/server
CMD ["bun", "run", "index.ts"]
