#!/bin/bash
echo "[start.sh] Starting up... DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo yes || echo no)"
echo "[start.sh] Node version: $(node --version)"
ls -la /app/node_modules/.bin/next 2>/dev/null && echo "[start.sh] next binary found" || echo "[start.sh] next binary NOT found"
echo "[start.sh] Starting Next.js server..."
exec node /app/node_modules/.bin/next start
