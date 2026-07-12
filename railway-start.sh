#!/bin/bash
set -e
echo "=== MOUNTAIN Music - Startup ==="

echo "[1/5] Copying music files to uploads directory..."
UPLOAD_DIR="${UPLOAD_DIR:-/tmp/uploads}"
mkdir -p "$UPLOAD_DIR"
if [ -d "music" ] && [ "$(ls -A music 2>/dev/null)" ]; then
  cp -rn music/* "$UPLOAD_DIR/" 2>/dev/null || echo "⚠️  music copy skipped (already exists or no files)"
  echo "✅ Music files checked"
fi

echo "[2/5] Pushing database schema..."
npx prisma db push --accept-data-loss 2>&1 || echo "⚠️  db push failed, continuing..."

echo "[3/5] Seeding database..."
npx prisma db seed 2>&1 || echo "⚠️  seed failed, continuing..."

echo "[4/5] Generating Prisma client..."
if [ ! -d "node_modules/.prisma/client" ]; then
  npx prisma generate
fi

echo "[4/5] Migrating old /music/ song URLs to /api/uploads/..."
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function migrate() {
  const songs = await p.song.findMany({ where: { audioUrl: { startsWith: '/music/' } } });
  for (const s of songs) {
    const newUrl = s.audioUrl.replace('/music/', '/api/uploads/');
    await p.song.update({ where: { id: s.id }, data: { audioUrl: newUrl } });
  }
  if (songs.length > 0) console.log('✅ Fixed ' + songs.length + ' song audio URLs');
}
await migrate();
await p.\$disconnect();
" 2>&1 || echo "⚠️  URL migration failed, continuing..."

echo "[5/5] Starting Next.js server..."
# Copy static files needed for standalone mode
if [ -d ".next/standalone" ]; then
  cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
  cp -r public .next/standalone/ 2>/dev/null || true
  cd .next/standalone
  exec node server.js
else
  exec npx next start -p ${PORT:-3000}
fi
