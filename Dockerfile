# Use a full Node.js image instead of Alpine to avoid dependency issues
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port (default for many Node.js apps)
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
