import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/data'

// POST /api/reset - Initialize/reset the database with initial data
export async function POST() {
  try {
    await initializeDatabase()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully'
    })
  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to initialize/reset the database',
    warning: 'This will reset all data to initial values'
  })
}
