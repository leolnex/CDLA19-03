import { NextResponse } from 'next/server'
import { getLeads, createLead } from '@/lib/data'
import type { Lead, LeadType, LeadStatus, ServiceCategory } from '@/lib/types'

export async function GET() {
  const leads = await getLeads()
  return NextResponse.json(leads)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // For cotizacion, service and business_type are required
    if (body.lead_type === 'cotizacion' && (!body.service || !body.business_type)) {
      return NextResponse.json(
        { error: 'Service and business type are required for quote requests' },
        { status: 400 }
      )
    }

    // Sanitize and validate input
    const leadData: Omit<Lead, 'id' | 'createdAt'> = {
      lead_type: (body.lead_type || 'contacto') as LeadType,
      name: String(body.name).trim().slice(0, 200),
      email: String(body.email).trim().toLowerCase().slice(0, 200),
      message: String(body.message).trim().slice(0, 5000),
      phone: body.phone ? String(body.phone).trim().slice(0, 50) : undefined,
      city: body.city ? String(body.city).trim().slice(0, 100) : undefined,
      service: body.service as ServiceCategory | undefined,
      business_type: body.business_type ? String(body.business_type).trim().slice(0, 200) : undefined,
      status: 'nuevo' as LeadStatus,
      lang: (body.lang === 'en' ? 'en' : 'es') as 'es' | 'en',
      source_url: body.source_url ? String(body.source_url).slice(0, 500) : '',
    }

    const lead = await createLead(leadData)

    // TODO: Send email notification to admin (leonardolnex@mail.com)
    // This would typically use a service like Resend, SendGrid, or nodemailer
    // For now, we just log the lead creation
    console.log('[CDLA] New lead created:', lead.id, lead.lead_type)

    return NextResponse.json({ ok: true, lead_id: lead.id, ...lead })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
