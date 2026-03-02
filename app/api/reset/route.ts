import { NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'
import { initialData } from '@/lib/initial-data'

const DATA_FILENAME = 'cdla-data.json'

// POST /api/reset - Force recreate the blob with initial data
export async function POST() {
  try {
    // First, try to delete the existing blob
    const { blobs } = await list()
    const dataBlob = blobs.find(b => b.pathname === DATA_FILENAME)
    
    if (dataBlob) {
      try {
        await del(dataBlob.url)
      } catch (delError) {
        console.error('Error deleting old blob:', delError)
      }
    }
    
    // Create new blob with initial data
    const blob = await put(DATA_FILENAME, JSON.stringify(initialData, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data reset to initial state',
      url: blob.url 
    })
  } catch (error) {
    console.error('Error resetting data:', error)
    return NextResponse.json({ 
      error: 'Failed to reset data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
