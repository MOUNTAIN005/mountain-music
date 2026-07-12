#!/bin/bash
# Railway startup script - DATABASE_URL fallback to Supabase
# Dashboard env vars always take precedence over this config

if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://postgres:jequirity0505@db.lyjpdfmefvayyzngetpw.supabase.co:5432/postgres?sslmode=require"
  echo "[start.sh] DATABASE_URL not set - using Supabase fallback"
fi

# Push database schema (create tables if not exist)
echo "[start.sh] Running database migration..."
npx prisma db push --accept-data-loss 2>&1 || echo "[start.sh] Migration skipped (non-fatal)"

# Try seed (may fail if tsx not available at runtime)
echo "[start.sh] Running database seed..."
npx prisma db seed 2>&1 || echo "[start.sh] Seed skipped (can run later)"

echo "[start.sh] Starting Next.js standalone server..."
exec node .next/standalone/server.js
