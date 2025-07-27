# Gunakan image node
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Salin file project
COPY . .

# Install dependencies
RUN pnpm install

# Build project
RUN pnpm build

# Ekspose port
EXPOSE 3002

# Jalankan aplikasi
CMD ["pnpm", "start"]
