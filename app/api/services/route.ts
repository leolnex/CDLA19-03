import { NextResponse } from 'next/server'
import { getServices, getPublishedServices, createService } from '@/lib/data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const all = searchParams.get('all') === 'true'
  
  const services = all ? await getServices() : await getPublishedServices()
  return NextResponse.json(services)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const service = await createService(body)
    return NextResponse.json(service)
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
