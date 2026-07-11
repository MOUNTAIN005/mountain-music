#!/bin/bash

cd /app

echo "=== MOUNTAIN Music - Railway Startup ==="

echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'YES' || echo 'NO')"

# Generate Prisma client (run at build already, but safe to redo)
echo "[1/2] Generating Prisma client..."
npx prisma generate

# Push database schema and seed (non-blocking - continue even if DB not ready)
echo "Running DB operations in background..."
npx prisma db push --accept-data-loss > /tmp/db-push.log 2>&1 &
echo "Database push running in background..."

# Start Next.js server
echo "[2/2] Starting Next.js server..."
exec npx next start -p ${PORT:-3000}
