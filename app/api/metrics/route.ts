import { NextResponse } from 'next/server'
import { getMetrics, updateMetrics, incrementVisits } from '@/lib/data'

export async function GET() {
  const metrics = await getMetrics()
  return NextResponse.json(metrics)
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const metrics = await updateMetrics(body)
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error updating metrics:', error)
    return NextResponse.json({ error: 'Failed to update metrics' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const visits = await incrementVisits()
    return NextResponse.json({ visits_total: visits })
  } catch (error) {
    console.error('Error incrementing visits:', error)
    return NextResponse.json({ error: 'Failed to increment visits' }, { status: 500 })
  }
}
