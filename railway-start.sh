#!/bin/bash
echo "=== MOUNTAIN Music - Startup ==="
echo "[1/2] Generating Prisma client..." && npx prisma generate
echo "[2/2] Starting Next.js server..."
exec npx next start -p ${PORT:-3000}
