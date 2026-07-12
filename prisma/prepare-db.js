/**
 * prepare-db.js
 * 
 * Detects the database environment and sets up the correct Prisma schema.
 * - If .env.local uses SQLite → copies schema.sqlite.prisma → schema.prisma
 * - Otherwise → copies schema.pg.prisma → schema.prisma (PostgreSQL, Railway default)
 * 
 * This ensures `schema.prisma` always has the right provider for the current env.
 */
const fs = require('fs');
const path = require('path');

const prismaDir = __dirname;
const schemaFile = path.join(prismaDir, 'schema.prisma');
const pgSchema = path.join(prismaDir, 'schema.pg.prisma');
const sqliteSchema = path.join(prismaDir, 'schema.sqlite.prisma');

// Check if we're in local dev with SQLite
const envLocal = path.join(prismaDir, '..', '.env.local');
const useSqlite = fs.existsSync(envLocal) && 
  fs.readFileSync(envLocal, 'utf8').includes('file:./dev.db');

const source = useSqlite ? sqliteSchema : pgSchema;
const provider = useSqlite ? 'sqlite' : 'postgresql';

try {
  fs.copyFileSync(source, schemaFile);
  console.log(`[prisma] Schema ready: ${path.basename(source)} (provider: ${provider})`);
} catch (err) {
  console.error(`[prisma] Failed to prepare schema: ${err.message}`);
  process.exit(1);
}
