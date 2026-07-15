import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

// GET /api/migrate – one-time database initialization
// Visit https://mountainmusic.vercel.app/api/migrate once after deploy
export async function GET() {
  try {
    const result = execSync(
      'npx prisma db push --accept-data-loss --skip-generate',
      {
        cwd: process.cwd(),
        timeout: 30_000,
        env: { ...process.env },
      }
    )
    return NextResponse.json({
      success: true,
      output: result.toString().slice(0, 1000),
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || String(err),
        stderr: err.stderr?.toString().slice(0, 1000),
      },
      { status: 500 }
    )
  }
}
