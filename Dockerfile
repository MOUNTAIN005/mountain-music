FROM node:22-slim

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

EXPOSE 3000
CMD ["sh", "start.sh"]
