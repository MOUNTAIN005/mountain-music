#!/bin/bash
echo "=== MOUNTAIN Music - Railway Startup ==="

# Generate Prisma client (needed for the app to work)
echo "[1/2] Generating Prisma client..." && npx prisma generate

# Start Next.js server
echo "[2/2] Starting Next.js server..."
exec npx next start -p ${PORT:-3000}
