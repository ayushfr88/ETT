# Backend Dockerfile - Node.js API
FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose API port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
