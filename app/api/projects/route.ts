import { NextResponse } from 'next/server'
import { getProjects, getPublishedProjects, getFeaturedProjects, createProject } from '@/lib/data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const all = searchParams.get('all') === 'true'
  const featured = searchParams.get('featured') === 'true'
  
  let projects
  if (featured) {
    projects = await getFeaturedProjects()
  } else if (all) {
    projects = await getProjects()
  } else {
    projects = await getPublishedProjects()
  }
  
  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const project = await createProject(body)
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
