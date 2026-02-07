# Dockerfile for Railway deployment
# Use Node.js 20 (matches .nvmrc)
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port (Railway will set PORT env var)
EXPOSE 5050

# Start the application
CMD ["node", "src/index.js"]

