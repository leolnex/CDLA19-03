import { executeQuery, sql } from './azure-sql'
import type { Service, Project, Lead, Settings, Metrics, ServiceCategory } from './types'
import { initialData } from './initial-data'

// =============================================
// SERVICIOS
// =============================================

export async function getServices(): Promise<Service[]> {
  try {
    return await executeQuery(async (pool) => {
      const result = await pool.request().query(`
        SELECT * FROM cdla_services ORDER BY updated_at DESC
      `)
      return result.recordset.map(mapServiceFromDb)
    })
  } catch (error) {
    console.error('Error getting services:', error)
    return initialData.services
  }
}

export async function getPublishedServices(): Promise<Service[]> {
  try {
    return await executeQuery(async (pool) => {
      const result = await pool.request().query(`
        SELECT * FROM cdla_services WHERE status = 'publish' ORDER BY updated_at DESC
      `)
      return result.recordset.map(mapServiceFromDb)
    })
  } catch (error) {
    console.error('Error getting published services:', error)
    return initialData.services.filter(s => s.status === 'publish')
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    return await executeQuery(async (pool) => {
      const result = await pool.request()
        .input('slug', sql.NVarChar(220), slug)
        .query(`SELECT * FROM cdla_services WHERE slug = @slug`)
      
      if (result.recordset.length === 0) return null
      return mapServiceFromDb(result.recordset[0])
    })
  } catch (error) {
    console.error('Error getting service by slug:', error)
    return initialData.services.find(s => s.slug === slug) || null
  }
}

export async function createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
  return await executeQuery(async (pool) => {
    const result = await pool.request()
      .input('slug', sql.NVarChar(220), service.slug)
      .input('category', sql.NVarChar(50), service.category)
      .input('custom_category', sql.NVarChar(100), service.custom_category || null)
      .input('status', sql.NVarChar(20), service.status)
      .input('title_es', sql.NVarChar(200), service.title_es)
      .input('title_en', sql.NVarChar(200), service.title_en || null)
      .input('desc_es', sql.NVarChar(sql.MAX), service.desc_es || null)
      .input('desc_en', sql.NVarChar(sql.MAX), service.desc_en || null)
      .input('ideal_es', sql.NVarChar(sql.MAX), service.ideal_es || null)
      .input('ideal_en', sql.NVarChar(sql.MAX), service.ideal_en || null)
      .input('bullets_es', sql.NVarChar(sql.MAX), JSON.stringify(service.bullets_es || []))
      .input('bullets_en', sql.NVarChar(sql.MAX), JSON.stringify(service.bullets_en || []))
      .input('hero_images', sql.NVarChar(sql.MAX), JSON.stringify(service.hero_images || []))
      .query(`
        INSERT INTO cdla_services (slug, category, custom_category, status, title_es, title_en, desc_es, desc_en, ideal_es, ideal_en, bullets_es, bullets_en, hero_images)
        OUTPUT INSERTED.*
        VALUES (@slug, @category, @custom_category, @status, @title_es, @title_en, @desc_es, @desc_en, @ideal_es, @ideal_en, @bullets_es, @bullets_en, @hero_images)
      `)
    
    return mapServiceFromDb(result.recordset[0])
  })
}

export async function updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
  return await executeQuery(async (pool) => {
    const setClauses: string[] = []
    const request = pool.request().input('id', sql.Int, parseInt(id))
    
    if (updates.slug !== undefined) {
      setClauses.push('slug = @slug')
      request.input('slug', sql.NVarChar(220), updates.slug)
    }
    if (updates.category !== undefined) {
      setClauses.push('category = @category')
      request.input('category', sql.NVarChar(50), updates.category)
    }
    if (updates.custom_category !== undefined) {
      setClauses.push('custom_category = @custom_category')
      request.input('custom_category', sql.NVarChar(100), updates.custom_category || null)
    }
    if (updates.status !== undefined) {
      setClauses.push('status = @status')
      request.input('status', sql.NVarChar(20), updates.status)
    }
    if (updates.title_es !== undefined) {
      setClauses.push('title_es = @title_es')
      request.input('title_es', sql.NVarChar(200), updates.title_es)
    }
    if (updates.title_en !== undefined) {
      setClauses.push('title_en = @title_en')
      request.input('title_en', sql.NVarChar(200), updates.title_en || null)
    }
    if (updates.desc_es !== undefined) {
      setClauses.push('desc_es = @desc_es')
      request.input('desc_es', sql.NVarChar(sql.MAX), updates.desc_es || null)
    }
    if (updates.desc_en !== undefined) {
      setClauses.push('desc_en = @desc_en')
      request.input('desc_en', sql.NVarChar(sql.MAX), updates.desc_en || null)
    }
    if (updates.ideal_es !== undefined) {
      setClauses.push('ideal_es = @ideal_es')
      request.input('ideal_es', sql.NVarChar(sql.MAX), updates.ideal_es || null)
    }
    if (updates.ideal_en !== undefined) {
      setClauses.push('ideal_en = @ideal_en')
      request.input('ideal_en', sql.NVarChar(sql.MAX), updates.ideal_en || null)
    }
    if (updates.bullets_es !== undefined) {
      setClauses.push('bullets_es = @bullets_es')
      request.input('bullets_es', sql.NVarChar(sql.MAX), JSON.stringify(updates.bullets_es || []))
    }
    if (updates.bullets_en !== undefined) {
      setClauses.push('bullets_en = @bullets_en')
      request.input('bullets_en', sql.NVarChar(sql.MAX), JSON.stringify(updates.bullets_en || []))
    }
    if (updates.hero_images !== undefined) {
      setClauses.push('hero_images = @hero_images')
      request.input('hero_images', sql.NVarChar(sql.MAX), JSON.stringify(updates.hero_images || []))
    }
    
    setClauses.push('updated_at = SYSUTCDATETIME()')
    
    const result = await request.query(`
      UPDATE cdla_services SET ${setClauses.join(', ')}
      OUTPUT INSERTED.*
      WHERE service_id = @id
    `)
    
    if (result.recordset.length === 0) return null
    return mapServiceFromDb(result.recordset[0])
  })
}

export async function deleteService(id: string): Promise<boolean> {
  return await executeQuery(async (pool) => {
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`DELETE FROM cdla_services WHERE service_id = @id`)
    
    return result.rowsAffected[0] > 0
  })
}

function mapServiceFromDb(row: Record<string, unknown>): Service {
  return {
    id: String(row.service_id),
    slug: row.slug as string,
    category: row.category as ServiceCategory,
    custom_category: row.custom_category as string | undefined,
    status: row.status as 'draft' | 'publish',
    title_es: row.title_es as string,
    title_en: row.title_en as string || '',
    desc_es: row.desc_es as string || '',
    desc_en: row.desc_en as string || '',
    ideal_es: row.ideal_es as string || '',
    ideal_en: row.ideal_en as string || '',
    bullets_es: parseJson(row.bullets_es as string, []),
    bullets_en: parseJson(row.bullets_en as string, []),
    hero_images: parseJson(row.hero_images as string, []),
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  }
}

// =============================================
// PROYECTOS
// =============================================

export async function getProjects(): Promise<Project[]> {
  try {
    return await executeQuery(async (pool) => {
      const result = await pool.request().query(`
        SELECT * FROM cdla_projects ORDER BY updated_at DESC
      `)
      return result.recordset.map(mapProjectFromDb)
    })
  } catch (error) {
    console.error('Error getting projects:', error)
    return initialData.projects
  }
}

export async function getPublishedProjects(): Promise<Project[]> {
  try {
    return await executeQuery(async (pool) => {
      const result = await pool.request().query(`
        SELECT * FROM cdla_projects WHERE status = 'publish' ORDER BY updated_at DESC
      `)
      return result.recordset.map(mapProjectFromDb)
    })
  } catch (error) {
    console.error('Error getting published projects:', error)
    return initialData.projects.filter(p => p.status === 'publish')
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    return await executeQuery(async (pool) => {
      const result = await pool.request().query(`
        SELECT * FROM cdla_projects WHERE status = 'publish' AND featured = 1 ORDER BY updated_at DESC
      `)
      return result.recordset.map(mapProjectFromDb)
    })
  } catch (error) {
    console.error('Error getting featured projects:', error)
    return initialData.projects.filter(p => p.status === 'publish' && p.featured)
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    return await executeQuery(async (pool) => {
      const result = await pool.request()
        .input('slug', sql.NVarChar(220), slug)
        .query(`SELECT * FROM cdla_projects WHERE slug = @slug`)
      
      if (result.recordset.length === 0) return null
      return mapProjectFromDb(result.recordset[0])
    })
  } catch (error) {
    console.error('Error getting project by slug:', error)
    return initialData.projects.find(p => p.slug === slug) || null
  }
}

export async function searchProjects(query: string, category?: string): Promise<Project[]> {
  try {
    return await executeQuery(async (pool) => {
      let queryStr = `
        SELECT * FROM cdla_projects 
        WHERE status = 'publish' 
        AND (title_es LIKE @query OR title_en LIKE @query OR location LIKE @query)
      `
      
      const request = pool.request()
        .input('query', sql.NVarChar(200), `%${query}%`)
      
      if (category && category !== 'todos') {
        queryStr += ` AND category = @category`
        request.input('category', sql.NVarChar(50), category)
      }
      
      queryStr += ` ORDER BY updated_at DESC`
      
      const result = await request.query(queryStr)
      return result.recordset.map(mapProjectFromDb)
    })
  } catch (error) {
    console.error('Error searching projects:', error)
    return initialData.projects.filter(p => 
      p.status === 'publish' && 
      (p.title_es.toLowerCase().includes(query.toLowerCase()) ||
       p.title_en.toLowerCase().includes(query.toLowerCase()))
    )
  }
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  return await executeQuery(async (pool) => {
    const result = await pool.request()
      .input('slug', sql.NVarChar(220), project.slug)
      .input('category', sql.NVarChar(50), project.category)
      .input('status', sql.NVarChar(20), project.status)
      .input('featured', sql.Bit, project.featured ? 1 : 0)
      .input('title_es', sql.NVarChar(200), project.title_es)
      .input('title_en', sql.NVarChar(200), project.title_en || null)
      .input('desc_es', sql.NVarChar(sql.MAX), project.desc_es || null)
      .input('desc_en', sql.NVarChar(sql.MAX), project.desc_en || null)
      .input('location', sql.NVarChar(200), project.location || null)
      .input('project_url', sql.NVarChar(500), project.project_url || null)
      .input('cover_image', sql.NVarChar(500), project.cover_image)
      .input('gallery_images', sql.NVarChar(sql.MAX), JSON.stringify(project.gallery_images || []))
      .query(`
        INSERT INTO cdla_projects (slug, category, status, featured, title_es, title_en, desc_es, desc_en, location, project_url, cover_image, gallery_images)
        OUTPUT INSERTED.*
        VALUES (@slug, @category, @status, @featured, @title_es, @title_en, @desc_es, @desc_en, @location, @project_url, @cover_image, @gallery_images)
      `)
    
    return mapProjectFromDb(result.recordset[0])
  })
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  return await executeQuery(async (pool) => {
    const setClauses: string[] = []
    const request = pool.request().input('id', sql.Int, parseInt(id))
    
    if (updates.slug !== undefined) {
      setClauses.push('slug = @slug')
      request.input('slug', sql.NVarChar(220), updates.slug)
    }
    if (updates.category !== undefined) {
      setClauses.push('category = @category')
      request.input('category', sql.NVarChar(50), updates.category)
    }
    if (updates.status !== undefined) {
      setClauses.push('status = @status')
      request.input('status', sql.NVarChar(20), updates.status)
    }
    if (updates.featured !== undefined) {
      setClauses.push('featured = @featured')
      request.input('featured', sql.Bit, updates.featured ? 1 : 0)
    }
    if (updates.title_es !== undefined) {
      setClauses.push('title_es = @title_es')
      request.input('title_es', sql.NVarChar(200), updates.title_es)
    }
    if (updates.title_en !== undefined) {
      setClauses.push('title_en = @title_en')
      request.input('title_en', sql.NVarChar(200), updates.title_en || null)
    }
    if (updates.desc_es !== undefined) {
      setClauses.push('desc_es = @desc_es')
      request.input('desc_es', sql.NVarChar(sql.MAX), updates.desc_es || null)
    }
    if (updates.desc_en !== undefined) {
      setClauses.push('desc_en = @desc_en')
      request.input('desc_en', sql.NVarChar(sql.MAX), updates.desc_en || null)
    }
    if (updates.location !== undefined) {
      setClauses.push('location = @location')
      request.input('location', sql.NVarChar(200), updates.location || null)
    }
    if (updates.project_url !== undefined) {
      setClauses.push('project_url = @project_url')
      request.input('project_url', sql.NVarChar(500), updates.project_url || null)
    }
    if (updates.cover_image !== undefined) {
      setClauses.push('cover_image = @cover_image')
      request.input('cover_image', sql.NVarChar(500), updates.cover_image)
    }
    if (updates.gallery_images !== undefined) {
      setClauses.push('gallery_images = @gallery_images')
      request.input('gallery_images', sql.NVarChar(sql.MAX), JSON.stringify(updates.gallery_images || []))
    }
    
    setClauses.push('updated_at = SYSUTCDATETIME()')
    
    const result = await request.query(`
      UPDATE cdla_projects SET ${setClauses.join(', ')}
      OUTPUT INSERTED.*
      WHERE project_id = @id
    `)
    
    if (result.recordset.length === 0) return null
    return mapProjectFromDb(result.recordset[0])
  })
}

export async function deleteProject(id: string): Promise<boolean> {
  return await executeQuery(async (pool) => {
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`DELETE FROM cdla_projects WHERE project_id = @id`)
    
    return result.rowsAffected[0] > 0
  })
}

function mapProjectFromDb(row: Record<string, unknown>): Project {
  return {
    id: String(row.project_id),
    slug: row.slug as string,
    category: row.category as ServiceCategory,
    status: row.status as 'draft' | 'publish',
    featured: Boolean(row.featured),
    title_es: row.title_es as string,
    title_en: row.title_en as string || '',
    desc_es: row.desc_es as string || '',
    desc_en: row.desc_en as string || '',
    location: row.location as string || '',
    project_url: row.project_url as string | undefined,
    cover_image: row.cover_image as string,
    gallery_images: parseJson(row.gallery_images as string, []),
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  }
}

// =============================================
// LEADS
// =============================================

export async function getLeads(): Promise<Lead[]> {
  try {
    return await executeQuery(async (pool) => {
      const result = await pool.request().query(`
        SELECT * FROM cdla_leads ORDER BY created_at DESC
      `)
      return result.recordset.map(mapLeadFromDb)
    })
  } catch (error) {
    console.error('Error getting leads:', error)
    return initialData.leads
  }
}

export async function createLead(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
  return await executeQuery(async (pool) => {
    const result = await pool.request()
      .input('lead_type', sql.NVarChar(20), lead.lead_type)
      .input('status', sql.NVarChar(20), lead.status || 'nuevo')
      .input('lang', sql.NVarChar(5), lead.lang || 'es')
      .input('source_url', sql.NVarChar(500), lead.source_url || null)
      .input('name', sql.NVarChar(200), lead.name)
      .input('email', sql.NVarChar(254), lead.email)
      .input('phone', sql.NVarChar(50), lead.phone || null)
      .input('city', sql.NVarChar(100), lead.city || null)
      .input('service', sql.NVarChar(50), lead.service || null)
      .input('business_type', sql.NVarChar(200), lead.business_type || null)
      .input('message', sql.NVarChar(sql.MAX), lead.message)
      .query(`
        INSERT INTO cdla_leads (lead_type, status, lang, source_url, name, email, phone, city, service, business_type, message)
        OUTPUT INSERTED.*
        VALUES (@lead_type, @status, @lang, @source_url, @name, @email, @phone, @city, @service, @business_type, @message)
      `)
    
    return mapLeadFromDb(result.recordset[0])
  })
}

export async function updateLeadStatus(id: string, status: Lead['status']): Promise<Lead | null> {
  return await executeQuery(async (pool) => {
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .input('status', sql.NVarChar(20), status)
      .query(`
        UPDATE cdla_leads SET status = @status
        OUTPUT INSERTED.*
        WHERE lead_id = @id
      `)
    
    if (result.recordset.length === 0) return null
    return mapLeadFromDb(result.recordset[0])
  })
}

export async function deleteLead(id: string): Promise<boolean> {
  return await executeQuery(async (pool) => {
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`DELETE FROM cdla_leads WHERE lead_id = @id`)
    
    return result.rowsAffected[0] > 0
  })
}

function mapLeadFromDb(row: Record<string, unknown>): Lead {
  return {
    id: String(row.lead_id),
    lead_type: row.lead_type as 'contacto' | 'cotizacion',
    status: row.status as 'nuevo' | 'leido' | 'cerrado',
    lang: row.lang as 'es' | 'en',
    source_url: row.source_url as string || '',
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string | undefined,
    city: row.city as string | undefined,
    service: row.service as ServiceCategory | undefined,
    business_type: row.business_type as string | undefined,
    message: row.message as string,
    createdAt: (row.created_at as Date).toISOString(),
  }
}

// =============================================
// SETTINGS
// =============================================

export async function getSettings(): Promise<Settings> {
  try {
    return await executeQuery(async (pool) => {
      const result = await pool.request().query(`
        SELECT setting_key, setting_value FROM cdla_settings
      `)
      
      const settings: Record<string, string> = {}
      for (const row of result.recordset) {
        settings[row.setting_key] = row.setting_value
      }
      
      return {
        email_admin: settings.email_admin || 'contacto@codedesignla.com',
        whatsapp_number: settings.whatsapp_number || '+15709144529',
        social_links: {
          facebook: settings.facebook_url,
          instagram: settings.instagram_url,
          twitter: settings.x_url,
          threads: settings.threads_url,
        }
      }
    })
  } catch (error) {
    console.error('Error getting settings:', error)
    return initialData.settings
  }
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  return await executeQuery(async (pool) => {
    const updates: Array<{ key: string; value: string | undefined }> = []
    
    if (settings.email_admin !== undefined) {
      updates.push({ key: 'email_admin', value: settings.email_admin })
    }
    if (settings.whatsapp_number !== undefined) {
      updates.push({ key: 'whatsapp_number', value: settings.whatsapp_number })
    }
    if (settings.social_links) {
      if (settings.social_links.facebook !== undefined) {
        updates.push({ key: 'facebook_url', value: settings.social_links.facebook })
      }
      if (settings.social_links.instagram !== undefined) {
        updates.push({ key: 'instagram_url', value: settings.social_links.instagram })
      }
      if (settings.social_links.twitter !== undefined) {
        updates.push({ key: 'x_url', value: settings.social_links.twitter })
      }
      if (settings.social_links.threads !== undefined) {
        updates.push({ key: 'threads_url', value: settings.social_links.threads })
      }
    }
    
    for (const { key, value } of updates) {
      await pool.request()
        .input('key', sql.NVarChar(100), key)
        .input('value', sql.NVarChar(sql.MAX), value || null)
        .query(`
          MERGE cdla_settings AS target
          USING (SELECT @key AS setting_key, @value AS setting_value) AS source
          ON target.setting_key = source.setting_key
          WHEN MATCHED THEN UPDATE SET setting_value = source.setting_value
          WHEN NOT MATCHED THEN INSERT (setting_key, setting_value) VALUES (source.setting_key, source.setting_value);
        `)
    }
    
    return await getSettings()
  })
}

// =============================================
// METRICS
// =============================================

export async function getMetrics(): Promise<Metrics> {
  try {
    return await executeQuery(async (pool) => {
      const result = await pool.request().query(`
        SELECT metric_key, metric_value FROM cdla_metrics
      `)
      
      const metrics: Record<string, number> = {}
      for (const row of result.recordset) {
        metrics[row.metric_key] = Number(row.metric_value)
      }
      
      return {
        projects_delivered: metrics.projects_delivered || 50,
        years_experience: metrics.years_experience || 5,
        active_countries: metrics.active_countries || 10,
        visits_total: metrics.visits_total || 0,
      }
    })
  } catch (error) {
    console.error('Error getting metrics:', error)
    return initialData.metrics
  }
}

export async function updateMetrics(metrics: Partial<Metrics>): Promise<Metrics> {
  return await executeQuery(async (pool) => {
    const updates: Array<{ key: string; value: number }> = []
    
    if (metrics.projects_delivered !== undefined) {
      updates.push({ key: 'projects_delivered', value: metrics.projects_delivered })
    }
    if (metrics.years_experience !== undefined) {
      updates.push({ key: 'years_experience', value: metrics.years_experience })
    }
    if (metrics.active_countries !== undefined) {
      updates.push({ key: 'active_countries', value: metrics.active_countries })
    }
    // visits_total is read-only from admin
    
    for (const { key, value } of updates) {
      await pool.request()
        .input('key', sql.NVarChar(100), key)
        .input('value', sql.BigInt, value)
        .query(`
          MERGE cdla_metrics AS target
          USING (SELECT @key AS metric_key, @value AS metric_value) AS source
          ON target.metric_key = source.metric_key
          WHEN MATCHED THEN UPDATE SET metric_value = source.metric_value
          WHEN NOT MATCHED THEN INSERT (metric_key, metric_value) VALUES (source.metric_key, source.metric_value);
        `)
    }
    
    return await getMetrics()
  })
}

export async function incrementVisits(): Promise<number> {
  try {
    return await executeQuery(async (pool) => {
      const result = await pool.request().query(`
        UPDATE cdla_metrics SET metric_value = metric_value + 1 
        OUTPUT INSERTED.metric_value
        WHERE metric_key = 'visits_total'
      `)
      
      return Number(result.recordset[0]?.metric_value || 0)
    })
  } catch (error) {
    console.error('Error incrementing visits:', error)
    return 0
  }
}

// =============================================
// INITIALIZATION
// =============================================

export async function initializeDatabase(): Promise<void> {
  try {
    await executeQuery(async (pool) => {
      // Create tables if they don't exist
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cdla_services')
        CREATE TABLE cdla_services (
          service_id INT IDENTITY(1,1) PRIMARY KEY,
          slug NVARCHAR(220) NOT NULL UNIQUE,
          category NVARCHAR(50) NOT NULL,
          custom_category NVARCHAR(100) NULL,
          status NVARCHAR(20) NOT NULL DEFAULT 'publish',
          title_es NVARCHAR(200) NOT NULL,
          title_en NVARCHAR(200) NULL,
          desc_es NVARCHAR(MAX) NULL,
          desc_en NVARCHAR(MAX) NULL,
          ideal_es NVARCHAR(MAX) NULL,
          ideal_en NVARCHAR(MAX) NULL,
          bullets_es NVARCHAR(MAX) NULL,
          bullets_en NVARCHAR(MAX) NULL,
          hero_images NVARCHAR(MAX) NULL,
          created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
          updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
        )
      `)

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cdla_projects')
        CREATE TABLE cdla_projects (
          project_id INT IDENTITY(1,1) PRIMARY KEY,
          slug NVARCHAR(220) NOT NULL UNIQUE,
          category NVARCHAR(50) NOT NULL,
          status NVARCHAR(20) NOT NULL DEFAULT 'publish',
          featured BIT NOT NULL DEFAULT 0,
          title_es NVARCHAR(200) NOT NULL,
          title_en NVARCHAR(200) NULL,
          desc_es NVARCHAR(MAX) NULL,
          desc_en NVARCHAR(MAX) NULL,
          location NVARCHAR(200) NULL,
          project_url NVARCHAR(500) NULL,
          cover_image NVARCHAR(500) NOT NULL,
          gallery_images NVARCHAR(MAX) NULL,
          created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
          updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
        )
      `)

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cdla_leads')
        CREATE TABLE cdla_leads (
          lead_id INT IDENTITY(1,1) PRIMARY KEY,
          lead_type NVARCHAR(20) NOT NULL,
          status NVARCHAR(20) NOT NULL DEFAULT 'nuevo',
          lang NVARCHAR(5) NOT NULL DEFAULT 'es',
          source_url NVARCHAR(500) NULL,
          name NVARCHAR(200) NOT NULL,
          email NVARCHAR(254) NOT NULL,
          phone NVARCHAR(50) NULL,
          city NVARCHAR(100) NULL,
          service NVARCHAR(50) NULL,
          business_type NVARCHAR(200) NULL,
          message NVARCHAR(MAX) NOT NULL,
          created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
        )
      `)

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cdla_settings')
        CREATE TABLE cdla_settings (
          setting_key NVARCHAR(100) PRIMARY KEY,
          setting_value NVARCHAR(MAX) NULL
        )
      `)

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cdla_metrics')
        CREATE TABLE cdla_metrics (
          metric_key NVARCHAR(100) PRIMARY KEY,
          metric_value BIGINT NOT NULL
        )
      `)

      // Seed settings if empty
      const settingsCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM cdla_settings`)
      if (settingsCount.recordset[0].cnt === 0) {
        await pool.request().query(`
          INSERT INTO cdla_settings (setting_key, setting_value) VALUES
          ('email_admin', 'contacto@codedesignla.com'),
          ('whatsapp_number', '+15709144529'),
          ('facebook_url', 'https://facebook.com/codedesignla'),
          ('instagram_url', 'https://instagram.com/codedesignla'),
          ('x_url', 'https://x.com/codedesignla'),
          ('threads_url', 'https://threads.net/@codedesignla')
        `)
      }

      // Seed metrics if empty
      const metricsCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM cdla_metrics`)
      if (metricsCount.recordset[0].cnt === 0) {
        await pool.request().query(`
          INSERT INTO cdla_metrics (metric_key, metric_value) VALUES
          ('projects_delivered', 50),
          ('years_experience', 5),
          ('active_countries', 10),
          ('visits_total', 0)
        `)
      }

      // Seed services if empty
      const servicesCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM cdla_services`)
      if (servicesCount.recordset[0].cnt === 0) {
        await pool.request().query(`
          INSERT INTO cdla_services (slug, category, status, title_es, title_en, desc_es, desc_en, ideal_es, ideal_en, bullets_es, bullets_en, hero_images)
          VALUES 
          ('sitio-web-profesional', 'website', 'publish', 'Sitio web profesional', 'Professional Website',
           'Diseño y desarrollo de sitios web modernos, rápidos y optimizados para conversión.',
           'Design and development of modern, fast websites optimized for conversion.',
           'Empresas, startups, profesionales independientes', 'Companies, startups, independent professionals',
           '["Diseño responsive","SEO optimizado","Carga rápida"]', '["Responsive design","SEO optimized","Fast loading"]',
           '["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"]'),
          
          ('aplicacion-movil', 'app-movil', 'publish', 'Aplicación móvil', 'Mobile Application',
           'Desarrollo de apps nativas y multiplataforma con interfaces intuitivas.',
           'Development of native and cross-platform apps with intuitive interfaces.',
           'Negocios con base de clientes móviles', 'Businesses with mobile customer base',
           '["iOS y Android","Interfaz intuitiva","Notificaciones push"]', '["iOS and Android","Intuitive interface","Push notifications"]',
           '["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1605170439002-90845e8c0137?w=800&h=600&fit=crop"]'),
          
          ('diseno-de-logo', 'logo', 'publish', 'Diseño de logo', 'Logo Design',
           'Creación de identidad visual única y memorable para tu marca.',
           'Creation of unique and memorable visual identity for your brand.',
           'Nuevos negocios, rebranding', 'New businesses, rebranding',
           '["Múltiples propuestas","Archivos editables","Manual de marca"]', '["Multiple proposals","Editable files","Brand manual"]',
           '["https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop"]'),
          
          ('gestion-redes-sociales', 'redes', 'publish', 'Gestión de redes sociales', 'Social Media Management',
           'Estrategia y contenido para tus redes sociales que genera engagement.',
           'Strategy and content for your social media that generates engagement.',
           'Marcas que buscan presencia digital', 'Brands looking for digital presence',
           '["Contenido mensual","Diseños profesionales","Reportes"]', '["Monthly content","Professional designs","Reports"]',
           '["https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1432888622747-4eb9a8f2c2e4?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=600&fit=crop"]'),
          
          ('tarjetas-presentacion', 'tarjetas', 'publish', 'Tarjetas de presentación', 'Business Cards',
           'Diseño profesional de tarjetas que dejan una impresión duradera.',
           'Professional card design that leaves a lasting impression.',
           'Profesionales, ejecutivos, networkers', 'Professionals, executives, networkers',
           '["Diseño premium","Archivos para impresión","Variantes"]', '["Premium design","Print-ready files","Variants"]',
           '["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop"]')
        `)
      }

      // Seed projects if empty
      const projectsCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM cdla_projects`)
      if (projectsCount.recordset[0].cnt === 0) {
        await pool.request().query(`
          INSERT INTO cdla_projects (slug, category, status, featured, title_es, title_en, desc_es, desc_en, location, project_url, cover_image, gallery_images)
          VALUES
          ('proyecto-1', 'website', 'publish', 1, 'Proyecto 1', 'Project 1',
           'Trabajo destacado con enfoque en detalles, acabados limpios y una presentación elegante del resultado.',
           'Featured work with focus on details, clean finishes and elegant presentation of the result.',
           'Quito', 'https://example.com/proyecto1',
           'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
           '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"]'),
          
          ('proyecto-2', 'app-movil', 'publish', 1, 'Proyecto 2', 'Project 2',
           'Trabajo destacado con enfoque en detalles, acabados limpios y una presentación elegante del resultado.',
           'Featured work with focus on details, clean finishes and elegant presentation of the result.',
           'Ambato', NULL,
           'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop',
           '["https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop"]'),
          
          ('proyecto-3', 'logo', 'publish', 1, 'Proyecto 3', 'Project 3',
           'Trabajo destacado con enfoque en detalles, acabados limpios y una presentación elegante del resultado.',
           'Featured work with focus on details, clean finishes and elegant presentation of the result.',
           'Cuenca', NULL,
           'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
           '["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop"]'),
          
          ('proyecto-4', 'website', 'publish', 1, 'Proyecto 4', 'Project 4',
           'Trabajo destacado con enfoque en detalles, acabados limpios y una presentación elegante del resultado.',
           'Featured work with focus on details, clean finishes and elegant presentation of the result.',
           'Quito', 'https://example.com/proyecto4',
           'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop',
           '["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"]'),
          
          ('proyecto-5', 'redes', 'publish', 1, 'Proyecto 5', 'Project 5',
           'Trabajo destacado con enfoque en detalles, acabados limpios y una presentación elegante del resultado.',
           'Featured work with focus on details, clean finishes and elegant presentation of the result.',
           'Ambato', NULL,
           'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
           '["https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop"]'),
          
          ('proyecto-6', 'tarjetas', 'publish', 1, 'Proyecto 6', 'Project 6',
           'Trabajo destacado con enfoque en detalles, acabados limpios y una presentación elegante del resultado.',
           'Featured work with focus on details, clean finishes and elegant presentation of the result.',
           'Cuenca', NULL,
           'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop',
           '["https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop"]')
        `)
      }

      console.log('[CDLA] Database initialized successfully')
    })
  } catch (error) {
    console.error('[CDLA] Database initialization error:', error)
    throw error
  }
}

// =============================================
// HELPERS
// =============================================

function parseJson<T>(str: string | null | undefined, defaultValue: T): T {
  if (!str) return defaultValue
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}
