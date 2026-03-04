import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/data'

// This endpoint initializes the database tables if they don't exist
// It's safe to call multiple times - it only creates tables that are missing

export async function GET() {
  try {
    await initializeDatabase()
    return NextResponse.json({ 
      success: true, 
      message: 'Database ready'
    })
  } catch (error) {
    console.error('[CDLA] Init error:', error)
    return NextResponse.json({ 
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
