FROM node:20-alpine

# Install Redis
RUN apk update && \
    apk add --no-cache redis

# Create app directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy server files
COPY server/ .

# Install TypeScript globally
RUN npm install -g typescript

# Compile TypeScript
RUN tsc

# Create startup script
RUN echo '#!/bin/sh\nredis-server --daemonize yes && node dist/routes.js' > start.sh
RUN chmod +x start.sh

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE $PORT

CMD ["./start.sh"]