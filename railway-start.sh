#!/bin/bash
set -e

cd /app

echo "=== MOUNTAIN Music - Railway Startup ==="

# Generate Prisma client
echo "[1/4] Generating Prisma client..."
npx prisma generate

# Push database schema to PostgreSQL
echo "[2/4] Pushing database schema..."
npx prisma db push --accept-data-loss

# Seed database
echo "[3/4] Seeding database..."
npx prisma db seed 2>/dev/null || echo "   Seed skipped (data may already exist)"

# Start Next.js server
echo "[4/4] Starting Next.js server..."
npx next start -p ${PORT:-3000}
