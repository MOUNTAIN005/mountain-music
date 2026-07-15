#!/bin/bash
# Railway startup script - DATABASE_URL fallback
# Dashboard env vars always take precedence over this config

if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://postgres:jequirity0505@db.lyjpdfmefvayyzngetpw.supabase.co:5432/postgres?sslmode=require"
  echo "[start.sh] DATABASE_URL not set - using Supabase fallback"
fi

# Run database migration in background (non-blocking for healthcheck)
echo "[start.sh] Running database migration in background..."
if [ -f "prisma/schema.prisma" ]; then
  (sleep 3 && npx prisma db push --accept-data-loss 2>&1 || echo "[start.sh] Migration failed (non-fatal)") &
  (sleep 8 && npx prisma db seed 2>&1 || echo "[start.sh] Seed skipped (can run later)") &
else
  echo "[start.sh] prisma/schema.prisma not found, skipping migration"
fi

# Start Next.js standalone server (handle different deployment paths)
echo "[start.sh] Starting Next.js standalone server..."
if [ -f "server.js" ]; then
  exec node server.js
elif [ -f ".next/standalone/server.js" ]; then
  exec node .next/standalone/server.js
elif command -v next &> /dev/null || [ -f "node_modules/.bin/next" ]; then
  echo "[start.sh] Using next start (nixpacks mode)..."
  exec npx next start
else
  echo "[start.sh] ERROR: no server found"
  ls -la
  exit 1
fi
