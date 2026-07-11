#!/bin/sh
set -e

cd /app

# Ensure the data directory exists (for SQLite)
mkdir -p /app/data

# Push the database schema (creates tables)
npx prisma db push --accept-data-loss --skip-generate

# Seed the database with admin user
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function seed() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@mountainmusic.com' } });
  if (!existing) {
    await prisma.user.create({ data: { email: 'admin@mountainmusic.com', name: '山影知道', password: await bcrypt.hash('admin123456', 12), role: 'admin' } });
    console.log('Admin user created');
  }
  const setting = await prisma.setting.findUnique({ where: { key: 'siteTitle' } });
  if (!setting) {
    await prisma.setting.create({ data: { key: 'siteTitle', value: '山影知道 | MOUNTAIN Music' } });
  }
  await prisma.\$disconnect();
  console.log('Seed complete');
}
seed();
"
echo "Init done"
