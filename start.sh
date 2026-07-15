#!/bin/bash
echo "[start.sh] ====== DEBUG: files in /app/ ======"
ls -la /app/ 2>/dev/null
echo "[start.sh] ====== DEBUG: .next/standalone/ structures ======"
ls -la /app/.next/standalone/ 2>/dev/null || echo "[start.sh] .next/standalone/ NOT FOUND"
ls -la /app/.next/ 2>/dev/null || echo "[start.sh] .next/ NOT FOUND"
echo "[start.sh] ====== END DEBUG ======"

if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://postgres:jequirity0505@db.lyjpdfmefvayyzngetpw.supabase.co:5432/postgres?sslmode=require"
  echo "[start.sh] DATABASE_URL not set - using Supabase fallback"
fi

echo "[start.sh] Starting Next.js server..."
if [ -f "server.js" ]; then
  echo "[start.sh] Found server.js - running it"
  exec node server.js
elif [ -f ".next/standalone/server.js" ]; then
  echo "[start.sh] Found .next/standalone/server.js"
  exec node .next/standalone/server.js
else
  echo "[start.sh] ERROR: no server.js found"
  ls -la
  exit 1
fi
