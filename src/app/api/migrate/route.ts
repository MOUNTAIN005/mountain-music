import { NextResponse } from 'next/server'

const CREATE_TABLES_SQL = `
-- User
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Album (defined first because Song references it)
CREATE TABLE IF NOT EXISTS "Album" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    "coverUrl" TEXT,
    "releaseDate" TIMESTAMPTZ,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Song
CREATE TABLE IF NOT EXISTS "Song" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL DEFAULT 'artist',
    "coverUrl" TEXT,
    "audioUrl" TEXT NOT NULL,
    lyrics TEXT,
    description TEXT,
    genre TEXT,
    duration INTEGER NOT NULL DEFAULT 0,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "albumId" INTEGER REFERENCES "Album"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RecommendedSong
CREATE TABLE IF NOT EXISTS "RecommendedSong" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL DEFAULT '山影知道',
    "coverUrl" TEXT,
    "audioUrl" TEXT NOT NULL,
    description TEXT,
    lyrics TEXT,
    album TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Story
CREATE TABLE IF NOT EXISTS "Story" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    "imageUrl" TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDisplayed" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "songId" INTEGER REFERENCES "Song"(id) ON DELETE SET NULL,
    "songTitle" TEXT,
    lyrics TEXT,
    "submittedBy" TEXT,
    "submitterEmail" TEXT,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contact
CREATE TABLE IF NOT EXISTS "Contact" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Setting
CREATE TABLE IF NOT EXISTS "Setting" (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
);

-- SocialLink
CREATE TABLE IF NOT EXISTS "SocialLink" (
    id SERIAL PRIMARY KEY,
    platform TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    "accountName" TEXT NOT NULL DEFAULT '',
    "qrCodeUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_song_album ON "Song"("albumId");
CREATE INDEX IF NOT EXISTS idx_story_song ON "Story"("songId");
CREATE INDEX IF NOT EXISTS idx_song_published ON "Song"("isPublished");
CREATE INDEX IF NOT EXISTS idx_song_recommended ON "Song"("isRecommended");
CREATE INDEX IF NOT EXISTS idx_setting_key ON "Setting"(key);
`

async function connectAndExecute(sql: string): Promise<string> {
  const { Pool } = await import('pg')
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
  const client = await pool.connect()
  try {
    const result = await client.query(sql)
    return `OK: ${result.rowCount || 'all'} tables created`
  } finally {
    client.release()
    await pool.end()
  }
}

// GET /api/migrate – initialize database tables
export async function GET() {
  try {
    const output = await connectAndExecute(CREATE_TABLES_SQL)
    return NextResponse.json({ success: true, output })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    )
  }
}
