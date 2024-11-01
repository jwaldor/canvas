FROM oven/bun:1

# Create app directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN bun install

# Copy server files
COPY server/ .

# Install TypeScript globally
RUN bun install -g typescript

# Compile TypeScript
RUN tsc

# Create startup script with absolute path
COPY <<'EOF' /start.sh
#!/bin/sh
# redis-server --daemonize yes
cd /app
bun --experimental-specifier-resolution=node dist/routes.js
EOF

RUN chmod +x /start.sh

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

ENV REDIS_URL=$REDIS_URL \
    REDISHOST=$REDISHOST \
    REDISPASSWORD=$REDISPASSWORD \
    REDISPORT=$REDISPORT \
    REDISUSER=$REDISUSER


EXPOSE $PORT

CMD ["/start.sh"]