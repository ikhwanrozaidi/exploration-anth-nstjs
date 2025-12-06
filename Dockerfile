FROM node:18-alpine

WORKDIR /app

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Copy package files
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Debug: show what was built
RUN echo "=== BUILD COMPLETED ===" && ls -la dist/ && ls -la dist/src/

# Remove dev dependencies
RUN npm prune --production

# Expose port 3003
EXPOSE 3003

# Start application
CMD ["node", "dist/src/main.js"]