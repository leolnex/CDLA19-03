export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, sql } from '@/lib/azure-sql'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const imageId = parseInt(id, 10)
    
    if (isNaN(imageId)) {
      return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
    }
    
    const image = await executeQuery(async (pool) => {
      const result = await pool.request()
        .input('id', sql.Int, imageId)
        .query(`
          SELECT mime_type, bytes FROM cdla_images WHERE image_id = @id
        `)
      
      if (result.recordset.length === 0) return null
      return result.recordset[0]
    })
    
    if (!image) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    
    // Return image with proper headers
    return new NextResponse(image.bytes, {
      status: 200,
      headers: {
        'Content-Type': image.mime_type,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
    
  } catch (error) {
    console.error('[CDLA] Image serve error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
