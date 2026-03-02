import { NextResponse } from 'next/server'
import { getLeads, createLead } from '@/lib/data'

export async function GET() {
  const leads = await getLeads()
  return NextResponse.json(leads)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const lead = await createLead(body)
    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
