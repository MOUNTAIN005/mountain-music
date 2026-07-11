#!/bin/bash
set -e
echo "=== MOUNTAIN Music - Startup ==="
echo "[1/3] Pushing database schema..."
npx prisma db push --accept-data-loss 2>&1 || echo "⚠️  db push failed, continuing..."
echo "[2/3] Seeding database..."
npx prisma db seed 2>&1 || echo "⚠️  seed failed, continuing..."
echo "[3/3] Generating Prisma client..."
if [ ! -d "node_modules/.prisma/client" ]; then
  npx prisma generate
fi
echo "[4/4] Starting Next.js server..."
exec npx next start -p ${PORT:-3000}
