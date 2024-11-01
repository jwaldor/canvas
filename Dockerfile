# Build stage for client
FROM node:20-alpine as client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Build stage for server
FROM node:20-alpine as server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .
RUN npm install typescript -g
RUN tsc

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install Redis
RUN apk add --no-cache redis

# Copy built client files
COPY --from=client-builder /app/client/dist ./client/dist

# Copy server files and dependencies
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production

# Create startup script
RUN echo "#!/bin/sh\nredis-server --daemonize yes && node dist/routes.js" > /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000
EXPOSE 4000
EXPOSE 6379

CMD ["/app/start.sh"]