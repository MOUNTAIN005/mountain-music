#!/bin/bash

cd /app

echo "=== MOUNTAIN Music - Railway Startup ==="

echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'YES' || echo 'NO')"

# Generate Prisma client
echo "[1/4] Generating Prisma client..."
npx prisma generate

# Push database schema (continue on error)
echo "[2/4] Pushing database schema..."
npx prisma db push --accept-data-loss || echo "   WARNING: Database push failed, continuing..."

# Seed database (skip if fails)
echo "[3/4] Seeding database..." 
npx prisma db seed 2>/dev/null || echo "   Seed skipped"

# Start Next.js server
echo "[4/4] Starting Next.js server..."
npx next start -p ${PORT:-3000}
