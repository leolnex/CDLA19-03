import { getProjectBySlug } from '@/lib/data'
import { ProjectDetail } from '@/components/projects/project-detail'
import { notFound } from 'next/navigation'

// Force dynamic rendering to avoid build-time blob access
export const dynamic = 'force-dynamic'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  return <ProjectDetail project={project} />
}
