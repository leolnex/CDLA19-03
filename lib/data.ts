import { executeQuery } from "./mysql";
import type {
  Service,
  Project,
  Lead,
  Settings,
  Metrics,
  ServiceCategory,
} from "./types";
import { initialData } from "./initial-data";

// =============================================
// HELPERS
// =============================================

type DbRow = Record<string, any>;

function toISO(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value as any).toISOString();
}

function toInt(value: unknown): number {
  const n = typeof value === "string" ? parseInt(value, 10) : Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function parseJson<T>(str: string | null | undefined, defaultValue: T): T {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

// =============================================
// SERVICIOS
// =============================================

export async function getServices(): Promise<Service[]> {
  try {
    const rows = await executeQuery<DbRow[]>(
      `SELECT * FROM cdla_services ORDER BY updated_at DESC`,
    );
    return rows.map(mapServiceFromDb);
  } catch (error) {
    console.error("Error getting services:", error);
    return initialData.services;
  }
}

export async function getPublishedServices(): Promise<Service[]> {
  try {
    const rows = await executeQuery<DbRow[]>(
      `SELECT * FROM cdla_services WHERE status = 'publish' ORDER BY updated_at DESC`,
    );
    return rows.map(mapServiceFromDb);
  } catch (error) {
    console.error("Error getting published services:", error);
    return initialData.services.filter((s) => s.status === "publish");
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const rows = await executeQuery<DbRow[]>(
      `SELECT * FROM cdla_services WHERE slug = ? LIMIT 1`,
      [String(slug)],
    );

    if (!rows.length) return null;
    return mapServiceFromDb(rows[0]);
  } catch (error) {
    console.error("Error getting service by slug:", error);
    return initialData.services.find((s) => s.slug === slug) || null;
  }
}

export async function createService(
  service: Omit<Service, "id" | "createdAt" | "updatedAt">,
): Promise<Service> {
  const result: any = await executeQuery(
    `INSERT INTO cdla_services
    (slug, category, custom_category, status, title_es, title_en, desc_es, desc_en, ideal_es, ideal_en, bullets_es, bullets_en, hero_images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      String(service.slug),
      String(service.category),
      service.custom_category || null,
      String(service.status),
      String(service.title_es),
      service.title_en ? String(service.title_en) : null,
      service.desc_es ? String(service.desc_es) : null,
      service.desc_en ? String(service.desc_en) : null,
      service.ideal_es ? String(service.ideal_es) : null,
      service.ideal_en ? String(service.ideal_en) : null,
      JSON.stringify(service.bullets_es || []),
      JSON.stringify(service.bullets_en || []),
      JSON.stringify(service.hero_images || []),
    ],
  );

  const rows = await executeQuery<DbRow[]>(
    `SELECT * FROM cdla_services WHERE service_id = ? LIMIT 1`,
    [result.insertId],
  );

  return mapServiceFromDb(rows[0]);
}

export async function updateService(
  id: string,
  updates: Partial<Service>,
): Promise<Service | null> {
  const idNum = toInt(id);
  if (!Number.isFinite(idNum)) throw new Error(`Invalid service id: ${id}`);

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.slug !== undefined) {
    fields.push("slug = ?");
    values.push(String(updates.slug));
  }
  if (updates.category !== undefined) {
    fields.push("category = ?");
    values.push(String(updates.category));
  }
  if (updates.custom_category !== undefined) {
    fields.push("custom_category = ?");
    values.push(updates.custom_category || null);
  }
  if (updates.status !== undefined) {
    fields.push("status = ?");
    values.push(String(updates.status));
  }
  if (updates.title_es !== undefined) {
    fields.push("title_es = ?");
    values.push(String(updates.title_es));
  }
  if (updates.title_en !== undefined) {
    fields.push("title_en = ?");
    values.push(updates.title_en ? String(updates.title_en) : null);
  }
  if (updates.desc_es !== undefined) {
    fields.push("desc_es = ?");
    values.push(updates.desc_es ? String(updates.desc_es) : null);
  }
  if (updates.desc_en !== undefined) {
    fields.push("desc_en = ?");
    values.push(updates.desc_en ? String(updates.desc_en) : null);
  }
  if (updates.ideal_es !== undefined) {
    fields.push("ideal_es = ?");
    values.push(updates.ideal_es ? String(updates.ideal_es) : null);
  }
  if (updates.ideal_en !== undefined) {
    fields.push("ideal_en = ?");
    values.push(updates.ideal_en ? String(updates.ideal_en) : null);
  }
  if (updates.bullets_es !== undefined) {
    fields.push("bullets_es = ?");
    values.push(JSON.stringify(updates.bullets_es || []));
  }
  if (updates.bullets_en !== undefined) {
    fields.push("bullets_en = ?");
    values.push(JSON.stringify(updates.bullets_en || []));
  }
  if (updates.hero_images !== undefined) {
    fields.push("hero_images = ?");
    values.push(JSON.stringify(updates.hero_images || []));
  }

  if (!fields.length) {
    const rows = await executeQuery<DbRow[]>(
      `SELECT * FROM cdla_services WHERE service_id = ? LIMIT 1`,
      [idNum],
    );
    return rows[0] ? mapServiceFromDb(rows[0]) : null;
  }

  fields.push("updated_at = CURRENT_TIMESTAMP");

  await executeQuery(
    `UPDATE cdla_services SET ${fields.join(", ")} WHERE service_id = ?`,
    [...values, idNum],
  );

  const rows = await executeQuery<DbRow[]>(
    `SELECT * FROM cdla_services WHERE service_id = ? LIMIT 1`,
    [idNum],
  );

  return rows[0] ? mapServiceFromDb(rows[0]) : null;
}

export async function deleteService(id: string): Promise<boolean> {
  const idNum = toInt(id);
  if (!Number.isFinite(idNum)) throw new Error(`Invalid service id: ${id}`);

  const result: any = await executeQuery(
    `DELETE FROM cdla_services WHERE service_id = ?`,
    [idNum],
  );

  return result.affectedRows > 0;
}

function mapServiceFromDb(row: DbRow): Service {
  return {
    id: String(row.service_id),
    slug: String(row.slug ?? ""),
    category: row.category as ServiceCategory,
    custom_category: row.custom_category || undefined,
    status: row.status as "draft" | "publish",
    title_es: row.title_es || "",
    title_en: row.title_en || "",
    desc_es: row.desc_es || "",
    desc_en: row.desc_en || "",
    ideal_es: row.ideal_es || "",
    ideal_en: row.ideal_en || "",
    bullets_es: parseJson(row.bullets_es, []),
    bullets_en: parseJson(row.bullets_en, []),
    hero_images: parseJson(row.hero_images, []),
    createdAt: toISO(row.created_at),
    updatedAt: toISO(row.updated_at),
  };
}

// =============================================
// PROYECTOS
// =============================================

export async function getProjects(): Promise<Project[]> {
  try {
    const rows = await executeQuery<DbRow[]>(
      `SELECT * FROM cdla_projects ORDER BY updated_at DESC`,
    );
    return rows.map(mapProjectFromDb);
  } catch (error) {
    console.error("Error getting projects:", error);
    return initialData.projects;
  }
}

export async function getPublishedProjects(): Promise<Project[]> {
  try {
    const rows = await executeQuery<DbRow[]>(
      `SELECT * FROM cdla_projects WHERE status = 'publish' ORDER BY updated_at DESC`,
    );
    return rows.map(mapProjectFromDb);
  } catch (error) {
    console.error("Error getting published projects:", error);
    return initialData.projects.filter((p) => p.status === "publish");
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const rows = await executeQuery<DbRow[]>(
      `SELECT * FROM cdla_projects WHERE status = 'publish' AND featured = 1 ORDER BY updated_at DESC`,
    );
    return rows.map(mapProjectFromDb);
  } catch (error) {
    console.error("Error getting featured projects:", error);
    return initialData.projects.filter(
      (p) => p.status === "publish" && p.featured,
    );
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const rows = await executeQuery<DbRow[]>(
      `SELECT * FROM cdla_projects WHERE slug = ? LIMIT 1`,
      [String(slug)],
    );

    if (!rows.length) return null;
    return mapProjectFromDb(rows[0]);
  } catch (error) {
    console.error("Error getting project by slug:", error);
    return initialData.projects.find((p) => p.slug === slug) || null;
  }
}

export async function searchProjects(
  query: string,
  category?: string,
): Promise<Project[]> {
  try {
    const qRaw = String(query ?? "").trim();
    const cat = category && category !== "todos" ? String(category) : null;

    let sql = `SELECT * FROM cdla_projects WHERE status = 'publish'`;
    const params: any[] = [];

    if (cat) {
      sql += ` AND category = ?`;
      params.push(cat);
    }

    if (qRaw) {
      const q = `%${qRaw}%`;
      const qNoDash = `%${qRaw.replace(/[-_]/g, " ")}%`;

      sql += `
        AND (
          title_es LIKE ?
          OR title_en LIKE ?
          OR location LIKE ?
          OR slug LIKE ?
          OR category LIKE ?
          OR REPLACE(REPLACE(category, '-', ' '), '_', ' ') LIKE ?
        )
      `;
      params.push(q, q, q, q, q, qNoDash);
    }

    sql += ` ORDER BY updated_at DESC`;

    const rows = await executeQuery<DbRow[]>(sql, params);
    return rows.map(mapProjectFromDb);
  } catch (error) {
    console.error("Error searching projects:", error);
    return initialData.projects.filter((p) => {
      const matchesCategory =
        !category || category === "todos" || p.category === category;

      const hay = [
        p.title_es || "",
        p.title_en || "",
        p.location || "",
        p.slug || "",
        p.category || "",
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && hay.includes(String(query || "").toLowerCase());
    });
  }
}

export async function createProject(
  project: Omit<Project, "id" | "createdAt" | "updatedAt">,
): Promise<Project> {
  const result: any = await executeQuery(
    `INSERT INTO cdla_projects
    (slug, category, status, featured, title_es, title_en, desc_es, desc_en, location, project_url, cover_image, gallery_images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      String(project.slug),
      String(project.category),
      String(project.status),
      project.featured ? 1 : 0,
      String(project.title_es),
      project.title_en ? String(project.title_en) : null,
      project.desc_es ? String(project.desc_es) : null,
      project.desc_en ? String(project.desc_en) : null,
      project.location ? String(project.location) : null,
      project.project_url ? String(project.project_url) : null,
      String((project as any).cover_image),
      JSON.stringify((project as any).gallery_images || []),
    ],
  );

  const rows = await executeQuery<DbRow[]>(
    `SELECT * FROM cdla_projects WHERE project_id = ? LIMIT 1`,
    [result.insertId],
  );

  return mapProjectFromDb(rows[0]);
}

export async function updateProject(
  id: string,
  updates: Partial<Project>,
): Promise<Project | null> {
  const idNum = toInt(id);
  if (!Number.isFinite(idNum)) throw new Error(`Invalid project id: ${id}`);

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.slug !== undefined) {
    fields.push("slug = ?");
    values.push(String(updates.slug));
  }
  if (updates.category !== undefined) {
    fields.push("category = ?");
    values.push(String(updates.category));
  }
  if (updates.status !== undefined) {
    fields.push("status = ?");
    values.push(String(updates.status));
  }
  if (updates.featured !== undefined) {
    fields.push("featured = ?");
    values.push(updates.featured ? 1 : 0);
  }
  if (updates.title_es !== undefined) {
    fields.push("title_es = ?");
    values.push(String(updates.title_es));
  }
  if (updates.title_en !== undefined) {
    fields.push("title_en = ?");
    values.push(updates.title_en ? String(updates.title_en) : null);
  }
  if (updates.desc_es !== undefined) {
    fields.push("desc_es = ?");
    values.push(updates.desc_es ? String(updates.desc_es) : null);
  }
  if (updates.desc_en !== undefined) {
    fields.push("desc_en = ?");
    values.push(updates.desc_en ? String(updates.desc_en) : null);
  }
  if (updates.location !== undefined) {
    fields.push("location = ?");
    values.push(updates.location ? String(updates.location) : null);
  }
  if (updates.project_url !== undefined) {
    fields.push("project_url = ?");
    values.push(updates.project_url ? String(updates.project_url) : null);
  }
  if ((updates as any).cover_image !== undefined) {
    fields.push("cover_image = ?");
    values.push(String((updates as any).cover_image));
  }
  if ((updates as any).gallery_images !== undefined) {
    fields.push("gallery_images = ?");
    values.push(JSON.stringify((updates as any).gallery_images || []));
  }

  if (!fields.length) {
    const rows = await executeQuery<DbRow[]>(
      `SELECT * FROM cdla_projects WHERE project_id = ? LIMIT 1`,
      [idNum],
    );
    return rows[0] ? mapProjectFromDb(rows[0]) : null;
  }

  fields.push("updated_at = CURRENT_TIMESTAMP");

  await executeQuery(
    `UPDATE cdla_projects SET ${fields.join(", ")} WHERE project_id = ?`,
    [...values, idNum],
  );

  const rows = await executeQuery<DbRow[]>(
    `SELECT * FROM cdla_projects WHERE project_id = ? LIMIT 1`,
    [idNum],
  );

  return rows[0] ? mapProjectFromDb(rows[0]) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  const idNum = toInt(id);
  if (!Number.isFinite(idNum)) throw new Error(`Invalid project id: ${id}`);

  const result: any = await executeQuery(
    `DELETE FROM cdla_projects WHERE project_id = ?`,
    [idNum],
  );

  return result.affectedRows > 0;
}

function mapProjectFromDb(row: DbRow): Project {
  return {
    id: String(row.project_id),
    slug: String(row.slug ?? ""),
    category: row.category as ServiceCategory,
    status: row.status as "draft" | "publish",
    featured: Boolean(row.featured),
    title_es: row.title_es || "",
    title_en: row.title_en || "",
    desc_es: row.desc_es || "",
    desc_en: row.desc_en || "",
    location: row.location || "",
    project_url: row.project_url || undefined,
    cover_image: String(row.cover_image ?? ""),
    gallery_images: parseJson(row.gallery_images, []),
    createdAt: toISO(row.created_at),
    updatedAt: toISO(row.updated_at),
  };
}

// =============================================
// LEADS
// =============================================

export async function getLeads(): Promise<Lead[]> {
  try {
    const rows = await executeQuery<DbRow[]>(
      `SELECT * FROM cdla_leads ORDER BY created_at DESC`,
    );
    return rows.map(mapLeadFromDb);
  } catch (error) {
    console.error("Error getting leads:", error);
    return initialData.leads;
  }
}

export async function createLead(
  lead: Omit<Lead, "id" | "createdAt">,
): Promise<Lead> {
  const result: any = await executeQuery(
    `INSERT INTO cdla_leads
    (lead_type, status, lang, source_url, name, email, phone, city, service, business_type, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      String(lead.lead_type),
      String(lead.status || "nuevo"),
      String(lead.lang || "es"),
      lead.source_url ? String(lead.source_url) : null,
      String(lead.name),
      String(lead.email),
      lead.phone ? String(lead.phone) : null,
      lead.city ? String(lead.city) : null,
      lead.service ? String(lead.service) : null,
      lead.business_type ? String(lead.business_type) : null,
      String(lead.message),
    ],
  );

  const rows = await executeQuery<DbRow[]>(
    `SELECT * FROM cdla_leads WHERE lead_id = ? LIMIT 1`,
    [result.insertId],
  );

  return mapLeadFromDb(rows[0]);
}

export async function updateLeadStatus(
  id: string,
  status: Lead["status"],
): Promise<Lead | null> {
  const idNum = toInt(id);
  if (!Number.isFinite(idNum)) throw new Error(`Invalid lead id: ${id}`);

  await executeQuery(`UPDATE cdla_leads SET status = ? WHERE lead_id = ?`, [
    String(status),
    idNum,
  ]);

  const rows = await executeQuery<DbRow[]>(
    `SELECT * FROM cdla_leads WHERE lead_id = ? LIMIT 1`,
    [idNum],
  );

  return rows[0] ? mapLeadFromDb(rows[0]) : null;
}

export async function deleteLead(id: string): Promise<boolean> {
  const idNum = toInt(id);
  if (!Number.isFinite(idNum)) throw new Error(`Invalid lead id: ${id}`);

  const result: any = await executeQuery(
    `DELETE FROM cdla_leads WHERE lead_id = ?`,
    [idNum],
  );

  return result.affectedRows > 0;
}

function mapLeadFromDb(row: DbRow): Lead {
  return {
    id: String(row.lead_id),
    lead_type: row.lead_type as "contacto" | "cotizacion",
    status: row.status as "nuevo" | "leido" | "cerrado",
    lang: row.lang as "es" | "en",
    source_url: row.source_url || "",
    name: row.name || "",
    email: row.email || "",
    phone: row.phone || undefined,
    city: row.city || undefined,
    service: row.service as ServiceCategory | undefined,
    business_type: row.business_type || undefined,
    message: row.message || "",
    createdAt: toISO(row.created_at),
  };
}

// =============================================
// SETTINGS
// =============================================

export async function getSettings(): Promise<Settings> {
  try {
    const rows = await executeQuery<DbRow[]>(
      `SELECT setting_key, setting_value FROM cdla_settings`,
    );

    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }

    return {
      email_admin: settings.email_admin || "Leonardolnex@gmail.com",
      whatsapp_number: settings.whatsapp_number || "+15709144529",
      social_links: {
        facebook: settings.facebook_url,
        instagram: settings.instagram_url,
        twitter: settings.x_url,
        threads: settings.threads_url,
      },
    };
  } catch (error) {
    console.error("Error getting settings:", error);
    return initialData.settings;
  }
}

export async function updateSettings(
  settings: Partial<Settings>,
): Promise<Settings> {
  const updates: Array<{ key: string; value: string | undefined }> = [];

  if (settings.email_admin !== undefined) {
    updates.push({ key: "email_admin", value: settings.email_admin });
  }
  if (settings.whatsapp_number !== undefined) {
    updates.push({ key: "whatsapp_number", value: settings.whatsapp_number });
  }
  if (settings.social_links) {
    if (settings.social_links.facebook !== undefined) {
      updates.push({
        key: "facebook_url",
        value: settings.social_links.facebook,
      });
    }
    if (settings.social_links.instagram !== undefined) {
      updates.push({
        key: "instagram_url",
        value: settings.social_links.instagram,
      });
    }
    if (settings.social_links.twitter !== undefined) {
      updates.push({
        key: "x_url",
        value: settings.social_links.twitter,
      });
    }
    if (settings.social_links.threads !== undefined) {
      updates.push({
        key: "threads_url",
        value: settings.social_links.threads,
      });
    }
  }

  for (const { key, value } of updates) {
    await executeQuery(
      `INSERT INTO cdla_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, value || null],
    );
  }

  return await getSettings();
}

// =============================================
// METRICS
// =============================================

export async function getMetrics(): Promise<Metrics> {
  try {
    const rows = await executeQuery<DbRow[]>(
      `SELECT metric_key, metric_value FROM cdla_metrics`,
    );

    const metrics: Record<string, number> = {};
    for (const row of rows) {
      metrics[row.metric_key] = Number(row.metric_value);
    }

    return {
      projects_delivered: metrics.projects_delivered || 50,
      years_experience: metrics.years_experience || 5,
      active_countries: metrics.active_countries || 10,
      visits_total: metrics.visits_total || 0,
    };
  } catch (error) {
    console.error("Error getting metrics:", error);
    return initialData.metrics;
  }
}

export async function updateMetrics(
  metrics: Partial<Metrics>,
): Promise<Metrics> {
  const updates: Array<{ key: string; value: number }> = [];

  if (metrics.projects_delivered !== undefined) {
    updates.push({
      key: "projects_delivered",
      value: metrics.projects_delivered,
    });
  }
  if (metrics.years_experience !== undefined) {
    updates.push({
      key: "years_experience",
      value: metrics.years_experience,
    });
  }
  if (metrics.active_countries !== undefined) {
    updates.push({
      key: "active_countries",
      value: metrics.active_countries,
    });
  }

  for (const { key, value } of updates) {
    await executeQuery(
      `INSERT INTO cdla_metrics (metric_key, metric_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value)`,
      [key, value],
    );
  }

  return await getMetrics();
}

export async function incrementVisits(): Promise<number> {
  try {
    await executeQuery(
      `INSERT INTO cdla_metrics (metric_key, metric_value)
       VALUES ('visits_total', 1)
       ON DUPLICATE KEY UPDATE metric_value = metric_value + 1`,
    );

    const rows = await executeQuery<DbRow[]>(
      `SELECT metric_value FROM cdla_metrics WHERE metric_key = 'visits_total' LIMIT 1`,
    );

    return Number(rows[0]?.metric_value || 0);
  } catch (error) {
    console.error("Error incrementing visits:", error);
    return 0;
  }
}

// =============================================
// INITIALIZATION (MYSQL)
// =============================================

export async function initializeDatabase(): Promise<void> {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS cdla_services (
        service_id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(220) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL,
        custom_category VARCHAR(100) NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'publish',
        title_es VARCHAR(200) NOT NULL,
        title_en VARCHAR(200) NULL,
        desc_es TEXT NULL,
        desc_en TEXT NULL,
        ideal_es TEXT NULL,
        ideal_en TEXT NULL,
        bullets_es TEXT NULL,
        bullets_en TEXT NULL,
        hero_images TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS cdla_projects (
        project_id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(220) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'publish',
        featured TINYINT(1) NOT NULL DEFAULT 0,
        title_es VARCHAR(200) NOT NULL,
        title_en VARCHAR(200) NULL,
        desc_es TEXT NULL,
        desc_en TEXT NULL,
        location VARCHAR(200) NULL,
        project_url VARCHAR(500) NULL,
        cover_image VARCHAR(500) NOT NULL,
        gallery_images TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS cdla_leads (
        lead_id INT AUTO_INCREMENT PRIMARY KEY,
        lead_type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'nuevo',
        lang VARCHAR(5) NOT NULL DEFAULT 'es',
        source_url VARCHAR(500) NULL,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(254) NOT NULL,
        phone VARCHAR(50) NULL,
        city VARCHAR(100) NULL,
        service VARCHAR(50) NULL,
        business_type VARCHAR(200) NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS cdla_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NULL
      )
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS cdla_metrics (
        metric_key VARCHAR(100) PRIMARY KEY,
        metric_value BIGINT NOT NULL
      )
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS cdla_images (
        image_id INT AUTO_INCREMENT PRIMARY KEY,
        owner_type VARCHAR(20) NOT NULL,
        owner_id INT NULL,
        role VARCHAR(20) NOT NULL,
        slot INT NULL,
        mime_type VARCHAR(100) NOT NULL,
        width INT NOT NULL,
        height INT NOT NULL,
        bytes LONGBLOB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await executeQuery(`
      CREATE INDEX IF NOT EXISTS IX_cdla_images_owner
      ON cdla_images (owner_type, owner_id, role)
    `).catch(async () => {
      // fallback para MySQL que no soporte IF NOT EXISTS en índices
      try {
        await executeQuery(`
          CREATE INDEX IX_cdla_images_owner
          ON cdla_images (owner_type, owner_id, role)
        `);
      } catch {
        // ignorar si ya existe
      }
    });

    const settingsCountRows = await executeQuery<DbRow[]>(
      `SELECT COUNT(*) as cnt FROM cdla_settings`,
    );
    if (Number(settingsCountRows[0].cnt) === 0) {
      await executeQuery(`
        INSERT INTO cdla_settings (setting_key, setting_value) VALUES
        ('email_admin', 'Leonardolnex@gmail.com'),
        ('whatsapp_number', '+15709144529'),
        ('facebook_url', 'https://facebook.com/codedesignla'),
        ('instagram_url', 'https://instagram.com/codedesignla'),
        ('x_url', 'https://x.com/codedesignla'),
        ('threads_url', 'https://threads.net/@codedesignla')
      `);
    }

    const metricsCountRows = await executeQuery<DbRow[]>(
      `SELECT COUNT(*) as cnt FROM cdla_metrics`,
    );
    if (Number(metricsCountRows[0].cnt) === 0) {
      await executeQuery(`
        INSERT INTO cdla_metrics (metric_key, metric_value) VALUES
        ('projects_delivered', 50),
        ('years_experience', 5),
        ('active_countries', 10),
        ('visits_total', 0)
      `);
    }

    const servicesCountRows = await executeQuery<DbRow[]>(
      `SELECT COUNT(*) as cnt FROM cdla_services`,
    );
    if (Number(servicesCountRows[0].cnt) === 0) {
      await executeQuery(`
        INSERT INTO cdla_services
        (slug, category, status, title_es, title_en, desc_es, desc_en, ideal_es, ideal_en, bullets_es, bullets_en, hero_images)
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
      `);
    }

    const projectsCountRows = await executeQuery<DbRow[]>(
      `SELECT COUNT(*) as cnt FROM cdla_projects`,
    );
    if (Number(projectsCountRows[0].cnt) === 0) {
      await executeQuery(`
        INSERT INTO cdla_projects
        (slug, category, status, featured, title_es, title_en, desc_es, desc_en, location, project_url, cover_image, gallery_images)
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
      `);
    }

    console.log("[CDLA] Database initialized successfully");
  } catch (error) {
    console.error("[CDLA] Database initialization error:", error);
    throw error;
  }
}
