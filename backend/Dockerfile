# Dockerfile for Railway deployment with Nginx proxy for WebSocket support
# Use Node.js 20 (matches .nvmrc)
FROM node:20

# Install nginx for WebSocket proxy
RUN apt-get update && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install

# Copy application code
COPY . .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# Copy start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose port (Railway will set PORT env var, nginx listens on 8080)
EXPOSE 8080

# Start nginx and Fastify
CMD ["/start.sh"]

