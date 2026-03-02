import { put, list } from '@vercel/blob'
import type { AppData, Service, Project, Lead, Settings, Metrics } from './types'
import { initialData } from './initial-data'

const DATA_FILENAME = 'cdla-data.json'

// Check if Blob token is available
function hasBlobToken(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

// Obtener datos desde Blob
export async function getData(): Promise<AppData> {
  // If no token available (e.g., during build), return initial data
  if (!hasBlobToken()) {
    return initialData
  }
  
  try {
    const { blobs } = await list()
    const dataBlob = blobs.find(b => b.pathname === DATA_FILENAME)
    
    if (dataBlob) {
      const response = await fetch(dataBlob.url, { cache: 'no-store' })
      
      // Verificar que la respuesta sea OK y sea JSON
      if (!response.ok) {
        console.error('Blob fetch failed with status:', response.status)
        return initialData
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        // Si no es JSON, puede ser que el blob esté corrupto, recrearlo
        console.error('Blob content is not JSON, recreating...')
        await saveData(initialData)
        return initialData
      }
      
      const text = await response.text()
      try {
        const data = JSON.parse(text)
        return data as AppData
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError)
        await saveData(initialData)
        return initialData
      }
    }
    
    // Si no existe, crear con datos iniciales
    await saveData(initialData)
    return initialData
  } catch (error) {
    console.error('Error getting data:', error)
    return initialData
  }
}

// Guardar datos en Blob
export async function saveData(data: AppData): Promise<void> {
  // If no token available, skip saving
  if (!hasBlobToken()) {
    console.warn('No BLOB_READ_WRITE_TOKEN available, skipping save')
    return
  }
  
  try {
    await put(DATA_FILENAME, JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
  } catch (error) {
    console.error('Error saving data:', error)
    throw error
  }
}

// === SERVICIOS ===
export async function getServices(): Promise<Service[]> {
  const data = await getData()
  return data.services
}

export async function getPublishedServices(): Promise<Service[]> {
  const data = await getData()
  return data.services.filter(s => s.status === 'publish')
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const data = await getData()
  return data.services.find(s => s.slug === slug) || null
}

export async function createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
  const data = await getData()
  const newService: Service = {
    ...service,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  data.services.push(newService)
  await saveData(data)
  return newService
}

export async function updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
  const data = await getData()
  const index = data.services.findIndex(s => s.id === id)
  if (index === -1) return null
  
  data.services[index] = {
    ...data.services[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  await saveData(data)
  return data.services[index]
}

export async function deleteService(id: string): Promise<boolean> {
  const data = await getData()
  const index = data.services.findIndex(s => s.id === id)
  if (index === -1) return false
  
  data.services.splice(index, 1)
  await saveData(data)
  return true
}

// === PROYECTOS ===
export async function getProjects(): Promise<Project[]> {
  const data = await getData()
  return data.projects
}

export async function getPublishedProjects(): Promise<Project[]> {
  const data = await getData()
  return data.projects.filter(p => p.status === 'publish')
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const data = await getData()
  return data.projects.filter(p => p.status === 'publish' && p.featured)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const data = await getData()
  return data.projects.find(p => p.slug === slug) || null
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const data = await getData()
  const newProject: Project = {
    ...project,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  data.projects.push(newProject)
  await saveData(data)
  return newProject
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const data = await getData()
  const index = data.projects.findIndex(p => p.id === id)
  if (index === -1) return null
  
  data.projects[index] = {
    ...data.projects[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  await saveData(data)
  return data.projects[index]
}

export async function deleteProject(id: string): Promise<boolean> {
  const data = await getData()
  const index = data.projects.findIndex(p => p.id === id)
  if (index === -1) return false
  
  data.projects.splice(index, 1)
  await saveData(data)
  return true
}

// === LEADS ===
export async function getLeads(): Promise<Lead[]> {
  const data = await getData()
  return data.leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function createLead(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
  const data = await getData()
  const newLead: Lead = {
    ...lead,
    id: Date.now().toString(),
    status: lead.status || 'nuevo',
    createdAt: new Date().toISOString()
  }
  data.leads.push(newLead)
  await saveData(data)
  return newLead
}

export async function updateLeadStatus(id: string, status: Lead['status']): Promise<Lead | null> {
  const data = await getData()
  const index = data.leads.findIndex(l => l.id === id)
  if (index === -1) return null
  
  data.leads[index].status = status as 'nuevo' | 'leido' | 'cerrado'
  await saveData(data)
  return data.leads[index]
}

export async function deleteLead(id: string): Promise<boolean> {
  const data = await getData()
  const index = data.leads.findIndex(l => l.id === id)
  if (index === -1) return false
  
  data.leads.splice(index, 1)
  await saveData(data)
  return true
}

// === SETTINGS ===
export async function getSettings(): Promise<Settings> {
  const data = await getData()
  return data.settings
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const data = await getData()
  data.settings = { ...data.settings, ...settings }
  await saveData(data)
  return data.settings
}

// === METRICS ===
export async function getMetrics(): Promise<Metrics> {
  const data = await getData()
  return data.metrics
}

export async function updateMetrics(metrics: Partial<Metrics>): Promise<Metrics> {
  const data = await getData()
  data.metrics = { ...data.metrics, ...metrics }
  await saveData(data)
  return data.metrics
}

export async function incrementVisits(): Promise<number> {
  const data = await getData()
  data.metrics.visits_total += 1
  await saveData(data)
  return data.metrics.visits_total
}
