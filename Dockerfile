FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Build aplikasi Next.js - INI YANG PENTING!
RUN pnpm run build

# Expose port
EXPOSE 3002

# Start aplikasi
CMD ["pnpm", "start"]
