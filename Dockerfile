FROM node:22-slim AS base

# Install pnpm
RUN npm install -g pnpm@latest

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
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
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone output
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/start.sh ./start.sh
COPY --from=base /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=base /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["sh", "start.sh"]
