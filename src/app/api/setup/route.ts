import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function GET() {
  try {
    const push = execSync('npx prisma db push --accept-data-loss', {
      timeout: 60000,
      encoding: 'utf-8',
    })
    const seed = execSync('npx prisma db seed', {
      timeout: 60000,
      encoding: 'utf-8',
    })
    return NextResponse.json({
      success: true,
      push: push.slice(-200),
      seed: seed.slice(-200),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Setup failed' },
      { status: 500 }
    )
  }
}
