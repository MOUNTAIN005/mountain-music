FROM node:22-slim AS base

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@10
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma/ ./prisma/
RUN pnpm install --frozen-lockfile
COPY . .
RUN node prisma/prepare-db.js
RUN pnpm prisma generate --schema=prisma/schema.pg.prisma
RUN pnpm next build

# Simple single-stage, copy everything and use next start
FROM node:22-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@10
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/package.json /app/start.sh /app/next.config.ts /app/tsconfig.json ./
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.ts ./
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["pnpm", "next", "start"]
