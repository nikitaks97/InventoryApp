# Use official Node.js latest LTS image as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port (default for many Node.js apps)
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
