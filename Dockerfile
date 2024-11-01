# Build stage for client
FROM node:20-alpine as client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
# Add environment variable for build
ARG VITE_WEBSOCKET_URL
ENV VITE_WEBSOCKET_URL=${VITE_WEBSOCKET_URL}
RUN npm run build

# Build stage for server
FROM node:20-alpine as server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .
# Fix the tsconfig include path
COPY server/tsconfig.json ./
RUN sed -i 's/"include": \["src\/\*\*\/\*"\]/"include": \["\*\*\/\*"\]/g' tsconfig.json
RUN npm install typescript -g
RUN tsc

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install Redis
RUN apk update && \
    apk add --no-cache redis

# Copy built client files
COPY --from=client-builder /app/client/dist ./client/dist

# Copy server files and dependencies
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production

# Create startup script
COPY <<'EOF' /app/start.sh
#!/bin/sh
redis-server --daemonize yes
cd /app/server
node dist/routes.js
EOF
RUN chmod +x /app/start.sh

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE $PORT
CMD ["/app/start.sh"]