-- ============================================
-- CDLA Azure SQL Database Schema
-- Base de datos: cdladatabase
-- Servidor: databasecdlasql.database.windows.net
-- ============================================

-- 1) TABLA: cdla_services
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cdla_services')
BEGIN
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
        bullets_es NVARCHAR(MAX) NULL,  -- JSON array
        bullets_en NVARCHAR(MAX) NULL,  -- JSON array
        hero_images NVARCHAR(MAX) NULL, -- JSON array (4 URLs)
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_cdla_services_category ON cdla_services(category);
    CREATE INDEX IX_cdla_services_status ON cdla_services(status);
    CREATE INDEX IX_cdla_services_updated_at ON cdla_services(updated_at);
END
GO

-- 2) TABLA: cdla_projects
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cdla_projects')
BEGIN
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
        gallery_images NVARCHAR(MAX) NULL, -- JSON array
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
    
    CREATE INDEX IX_cdla_projects_category ON cdla_projects(category);
    CREATE INDEX IX_cdla_projects_status ON cdla_projects(status);
    CREATE INDEX IX_cdla_projects_featured ON cdla_projects(featured);
    CREATE INDEX IX_cdla_projects_updated_at ON cdla_projects(updated_at);
END
GO

-- 3) TABLA: cdla_leads
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cdla_leads')
BEGIN
    CREATE TABLE cdla_leads (
        lead_id INT IDENTITY(1,1) PRIMARY KEY,
        lead_type NVARCHAR(20) NOT NULL,  -- 'contacto' | 'cotizacion'
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
    );
    
    CREATE INDEX IX_cdla_leads_created_at ON cdla_leads(created_at DESC);
    CREATE INDEX IX_cdla_leads_status ON cdla_leads(status);
    CREATE INDEX IX_cdla_leads_lead_type ON cdla_leads(lead_type);
END
GO

-- 4) TABLA: cdla_settings (key/value)
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cdla_settings')
BEGIN
    CREATE TABLE cdla_settings (
        setting_key NVARCHAR(100) PRIMARY KEY,
        setting_value NVARCHAR(MAX) NULL
    );
    
    -- Seed initial settings
    INSERT INTO cdla_settings (setting_key, setting_value) VALUES
        ('email_admin', 'contacto@codedesignla.com'),
        ('whatsapp_number', '+15709144529'),
        ('facebook_url', 'https://facebook.com/codedesignla'),
        ('instagram_url', 'https://instagram.com/codedesignla'),
        ('x_url', 'https://x.com/codedesignla'),
        ('threads_url', 'https://threads.net/@codedesignla');
END
GO

-- 5) TABLA: cdla_metrics
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cdla_metrics')
BEGIN
    CREATE TABLE cdla_metrics (
        metric_key NVARCHAR(100) PRIMARY KEY,
        metric_value BIGINT NOT NULL
    );
    
    -- Seed initial metrics
    INSERT INTO cdla_metrics (metric_key, metric_value) VALUES
        ('projects_delivered', 50),
        ('years_experience', 5),
        ('active_countries', 10),
        ('visits_total', 0);
END
GO

-- ============================================
-- SEED DATA: Servicios iniciales
-- ============================================
IF NOT EXISTS (SELECT 1 FROM cdla_services)
BEGIN
    INSERT INTO cdla_services (slug, category, status, title_es, title_en, desc_es, desc_en, ideal_es, ideal_en, bullets_es, bullets_en, hero_images)
    VALUES 
    ('sitio-web-profesional', 'website', 'publish', 
     'Sitio web profesional', 'Professional Website',
     'Diseño y desarrollo de sitios web modernos, rápidos y optimizados para conversión.',
     'Design and development of modern, fast websites optimized for conversion.',
     'Empresas, startups, profesionales independientes',
     'Companies, startups, independent professionals',
     '["Diseño responsive","SEO optimizado","Carga rápida"]',
     '["Responsive design","SEO optimized","Fast loading"]',
     '["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"]'),
    
    ('aplicacion-movil', 'app-movil', 'publish',
     'Aplicación móvil', 'Mobile Application',
     'Desarrollo de apps nativas y multiplataforma con interfaces intuitivas.',
     'Development of native and cross-platform apps with intuitive interfaces.',
     'Negocios con base de clientes móviles',
     'Businesses with mobile customer base',
     '["iOS y Android","Interfaz intuitiva","Notificaciones push"]',
     '["iOS and Android","Intuitive interface","Push notifications"]',
     '["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1605170439002-90845e8c0137?w=800&h=600&fit=crop"]'),
    
    ('diseno-de-logo', 'logo', 'publish',
     'Diseño de logo', 'Logo Design',
     'Creación de identidad visual única y memorable para tu marca.',
     'Creation of unique and memorable visual identity for your brand.',
     'Nuevos negocios, rebranding',
     'New businesses, rebranding',
     '["Múltiples propuestas","Archivos editables","Manual de marca"]',
     '["Multiple proposals","Editable files","Brand manual"]',
     '["https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop"]'),
    
    ('gestion-redes-sociales', 'redes', 'publish',
     'Gestión de redes sociales', 'Social Media Management',
     'Estrategia y contenido para tus redes sociales que genera engagement.',
     'Strategy and content for your social media that generates engagement.',
     'Marcas que buscan presencia digital',
     'Brands looking for digital presence',
     '["Contenido mensual","Diseños profesionales","Reportes"]',
     '["Monthly content","Professional designs","Reports"]',
     '["https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1432888622747-4eb9a8f2c2e4?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=600&fit=crop"]'),
    
    ('tarjetas-presentacion', 'tarjetas', 'publish',
     'Tarjetas de presentación', 'Business Cards',
     'Diseño profesional de tarjetas que dejan una impresión duradera.',
     'Professional card design that leaves a lasting impression.',
     'Profesionales, ejecutivos, networkers',
     'Professionals, executives, networkers',
     '["Diseño premium","Archivos para impresión","Variantes"]',
     '["Premium design","Print-ready files","Variants"]',
     '["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop"]');
END
GO

-- ============================================
-- SEED DATA: Proyectos iniciales
-- ============================================
IF NOT EXISTS (SELECT 1 FROM cdla_projects)
BEGIN
    INSERT INTO cdla_projects (slug, category, status, featured, title_es, title_en, desc_es, desc_en, location, project_url, cover_image, gallery_images)
    VALUES
    ('proyecto-1', 'website', 'publish', 1,
     'Proyecto 1', 'Project 1',
     'Trabajo destacado con enfoque en detalles, acabados limpios y una presentación elegante del resultado.',
     'Featured work with focus on details, clean finishes and elegant presentation of the result.',
     'Quito', 'https://example.com/proyecto1',
     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
     '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"]'),
    
    ('proyecto-2', 'app-movil', 'publish', 1,
     'Proyecto 2', 'Project 2',
     'Trabajo destacado con enfoque en detalles, acabados limpios y una presentación elegante del resultado.',
     'Featured work with focus on details, clean finishes and elegant presentation of the result.',
     'Ambato', NULL,
     'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop',
     '["https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop"]'),
    
    ('proyecto-3', 'logo', 'publish', 1,
     'Proyecto 3', 'Project 3',
     'Trabajo destacado con enfoque en detalles, acabados limpios y una presentación elegante del resultado.',
     'Featured work with focus on details, clean finishes and elegant presentation of the result.',
     'Cuenca', NULL,
     'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
     '["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop"]'),
    
    ('proyecto-4', 'website', 'publish', 1,
     'Proyecto 4', 'Project 4',
     'Trabajo destacado con enfoque en detalles, acabados limpios y una presentación elegante del resultado.',
     'Featured work with focus on details, clean finishes and elegant presentation of the result.',
     'Quito', 'https://example.com/proyecto4',
     'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop',
     '["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"]'),
    
    ('proyecto-5', 'redes', 'publish', 1,
     'Proyecto 5', 'Project 5',
     'Trabajo destacado con enfoque en detalles, acabados limpios y una presentación elegante del resultado.',
     'Featured work with focus on details, clean finishes and elegant presentation of the result.',
     'Ambato', NULL,
     'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
     '["https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop"]'),
    
    ('proyecto-6', 'tarjetas', 'publish', 1,
     'Proyecto 6', 'Project 6',
     'Trabajo destacado con enfoque en detalles, acabados limpios y una presentación elegante del resultado.',
     'Featured work with focus on details, clean finishes and elegant presentation of the result.',
     'Cuenca', NULL,
     'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop',
     '["https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop"]');
END
GO

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS OPCIONALES
-- ============================================

-- Incrementar visitas (atómico)
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_increment_visits')
    DROP PROCEDURE sp_increment_visits;
GO

CREATE PROCEDURE sp_increment_visits
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE cdla_metrics 
    SET metric_value = metric_value + 1 
    WHERE metric_key = 'visits_total';
    
    SELECT metric_value FROM cdla_metrics WHERE metric_key = 'visits_total';
END
GO

PRINT 'Schema created successfully!';
