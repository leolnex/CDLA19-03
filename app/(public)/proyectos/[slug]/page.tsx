import { getPublishedProjects, getProjectBySlug } from '@/lib/data'
import { ProjectDetail } from '@/components/projects/project-detail'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const projects = await getPublishedProjects()
  return projects.map(project => ({
    slug: project.slug,
  }))
}

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
