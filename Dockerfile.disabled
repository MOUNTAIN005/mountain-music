FROM node:22-slim AS base

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install pnpm
 # Pin pnpm to v10 to avoid build script approval requirement in v11
 RUN npm install -g pnpm@10

WORKDIR /app

# Copy package files and pnpm config
COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma/ ./prisma/

# Install ALL dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build the application
RUN node prisma/prepare-db.js
RUN pnpm prisma generate --schema=prisma/schema.pg.prisma
RUN pnpm next build

# Production stage
FROM node:22-slim AS runner

# Install OpenSSL for Prisma (needed at runtime too)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone output
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/start.sh ./start.sh

EXPOSE 3000

CMD ["sh", "start.sh"]
