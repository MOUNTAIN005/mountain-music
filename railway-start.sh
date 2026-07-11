#!/bin/bash
echo "=== MOUNTAIN Music - Railway Startup ==="

# Generate Prisma client
echo "[1/4] Generating Prisma client..." && npx prisma generate

# Push database schema (30s timeout)
echo "[2/4] Pushing database schema..."
timeout 30 npx prisma db push --accept-data-loss 2>/dev/null && echo "   Schema pushed" || echo "   Schema push skipped (may already exist)"

# Seed database (30s timeout)
echo "[3/4] Seeding database..."
timeout 30 npx prisma db seed 2>/dev/null && echo "   Seed completed" || echo "   Seed skipped"

# Start Next.js server
echo "[4/4] Starting Next.js server..."
exec npx next start -p ${PORT:-3000}
