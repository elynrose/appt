# Dockerfile for deployment (works with Railway, Render, etc.)
# Use Node.js 20 (matches .nvmrc)
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install

# Copy application code
COPY . .

# Expose port (Render/Railway will set PORT env var)
EXPOSE 5050

# Start the application
# Note: For Railway with Nginx, use start:with-nginx script
# For Render, this simple start works fine
CMD ["node", "src/index.js"]

