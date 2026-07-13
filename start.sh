#!/bin/bash
# Railway startup script - DATABASE_URL fallback
# Dashboard env vars always take precedence over this config

if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://postgres:jequirity0505@db.lyjpdfmefvayyzngetpw.supabase.co:5432/postgres?sslmode=require"
  echo "[start.sh] DATABASE_URL not set - using Supabase fallback"
fi

# Run database migration
echo "[start.sh] Running database migration..."
if [ -f "prisma/schema.prisma" ]; then
  npx prisma db push --accept-data-loss 2>&1 || echo "[start.sh] Migration skipped (non-fatal)"
  npx prisma db seed 2>&1 || echo "[start.sh] Seed skipped (can run later)"
else
  echo "[start.sh] prisma/schema.prisma not found, skipping migration"
fi

# Start Next.js standalone server (handle different deployment paths)
echo "[start.sh] Starting Next.js standalone server..."
if [ -f ".next/standalone/server.js" ]; then
  exec node .next/standalone/server.js
elif [ -f "server.js" ]; then
  exec node server.js
else
  echo "[start.sh] ERROR: server.js not found in .next/standalone/ or ./"
  ls -la
  exit 1
fi
