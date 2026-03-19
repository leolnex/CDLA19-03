import type { AppData } from "./types";

export const initialData: AppData = {
  services: [
    {
      id: "1",
      slug: "sitio-web-profesional",
      category: "website",
      title_es: "Sitio web profesional",
      title_en: "Professional Website",
      desc_es:
        "Diseño y desarrollo de sitios web modernos, rápidos y optimizados para conversión.",
      desc_en:
        "Design and development of modern, fast websites optimized for conversion.",
      ideal_es: "Empresas, startups, profesionales independientes",
      ideal_en: "Businesses, startups, independent professionals",
      bullets_es: ["Diseño responsive", "SEO optimizado", "Carga rápida"],
      bullets_en: ["Responsive design", "SEO optimized", "Fast loading"],
      hero_images: [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=300&fit=crop",
      ],
      status: "publish",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      slug: "aplicacion-movil",
      category: "app-movil",
      title_es: "Aplicación móvil",
      title_en: "Mobile Application",
      desc_es:
        "Desarrollo de apps nativas y multiplataforma con interfaces intuitivas.",
      desc_en:
        "Development of native and cross-platform apps with intuitive interfaces.",
      ideal_es: "Negocios con base de clientes móviles",
      ideal_en: "Businesses with mobile customer base",
      bullets_es: [
        "iOS y Android",
        "Interfaz intuitiva",
        "Notificaciones push",
      ],
      bullets_en: [
        "iOS and Android",
        "Intuitive interface",
        "Push notifications",
      ],
      hero_images: [
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1522125670776-3c7abb882bc2?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?w=400&h=300&fit=crop",
      ],
      status: "publish",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      slug: "diseno-de-logo",
      category: "logo",
      title_es: "Diseño de logo",
      title_en: "Logo Design",
      desc_es: "Creación de identidad visual única y memorable para tu marca.",
      desc_en:
        "Creation of unique and memorable visual identity for your brand.",
      ideal_es: "Nuevos negocios, rebranding",
      ideal_en: "New businesses, rebranding",
      bullets_es: [
        "Múltiples propuestas",
        "Archivos editables",
        "Manual de marca",
      ],
      bullets_en: ["Multiple proposals", "Editable files", "Brand manual"],
      hero_images: [
        "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=300&fit=crop",
      ],
      status: "publish",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      slug: "gestion-redes-sociales",
      category: "redes",
      title_es: "Gestión de redes sociales",
      title_en: "Social Media Management",
      desc_es:
        "Estrategia y contenido para tus redes sociales que genera engagement.",
      desc_en:
        "Strategy and content for your social media that generates engagement.",
      ideal_es: "Marcas que buscan presencia digital",
      ideal_en: "Brands looking for digital presence",
      bullets_es: ["Contenido mensual", "Diseños profesionales", "Reportes"],
      bullets_en: ["Monthly content", "Professional designs", "Reports"],
      hero_images: [
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=300&fit=crop",
      ],
      status: "publish",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "5",
      slug: "tarjetas-de-presentacion",
      category: "tarjetas",
      title_es: "Tarjetas de presentación",
      title_en: "Business Cards",
      desc_es:
        "Diseño profesional de tarjetas que dejan una impresión duradera.",
      desc_en: "Professional card design that leaves a lasting impression.",
      ideal_es: "Profesionales, ejecutivos, networkers",
      ideal_en: "Professionals, executives, networkers",
      bullets_es: ["Diseño premium", "Archivos para impresión", "Variantes"],
      bullets_en: ["Premium design", "Print-ready files", "Variants"],
      hero_images: [
        "https://images.unsplash.com/photo-1616628188859-7a11abb6fcc9?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1572502742566-c068c3bf72e3?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=300&fit=crop",
      ],
      status: "publish",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  projects: [
    {
      id: "1",
      slug: "proyecto-1",
      category: "website",
      title_es: "Proyecto 1",
      title_en: "Project 1",
      desc_es:
        "Trabajo destacado con enfoque en detalles, acabado limpio y una presentación elegante del resultado.",
      desc_en:
        "Featured work focused on details, clean finish and elegant presentation of the result.",
      location: "Quito",
      featured: true,
      cover_image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      gallery_images: [],
      status: "publish",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      slug: "proyecto-2",
      category: "app-movil",
      title_es: "Proyecto 2",
      title_en: "Project 2",
      desc_es:
        "Trabajo destacado con enfoque en detalles, acabado limpio y una presentación elegante del resultado.",
      desc_en:
        "Featured work focused on details, clean finish and elegant presentation of the result.",
      location: "Ambato",
      featured: true,
      cover_image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop",
      gallery_images: [],
      status: "publish",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      slug: "proyecto-3",
      category: "logo",
      title_es: "Proyecto 3",
      title_en: "Project 3",
      desc_es:
        "Trabajo destacado con enfoque en detalles, acabado limpio y una presentación elegante del resultado.",
      desc_en:
        "Featured work focused on details, clean finish and elegant presentation of the result.",
      location: "Cuenca",
      featured: true,
      cover_image:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
      gallery_images: [],
      status: "publish",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      slug: "proyecto-4",
      category: "website",
      title_es: "Proyecto 4",
      title_en: "Project 4",
      desc_es:
        "Trabajo destacado con enfoque en detalles, acabado limpio y una presentación elegante del resultado.",
      desc_en:
        "Featured work focused on details, clean finish and elegant presentation of the result.",
      location: "Quito",
      featured: true,
      cover_image:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop",
      gallery_images: [],
      status: "publish",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "5",
      slug: "proyecto-5",
      category: "redes",
      title_es: "Proyecto 5",
      title_en: "Project 5",
      desc_es:
        "Trabajo destacado con enfoque en detalles, acabado limpio y una presentación elegante del resultado.",
      desc_en:
        "Featured work focused on details, clean finish and elegant presentation of the result.",
      location: "Ambato",
      featured: true,
      cover_image:
        "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop",
      gallery_images: [],
      status: "publish",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "6",
      slug: "proyecto-6",
      category: "tarjetas",
      title_es: "Proyecto 6",
      title_en: "Project 6",
      desc_es:
        "Trabajo destacado con enfoque en detalles, acabado limpio y una presentación elegante del resultado.",
      desc_en:
        "Featured work focused on details, clean finish and elegant presentation of the result.",
      location: "Cuenca",
      featured: true,
      cover_image:
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop",
      gallery_images: [],
      status: "publish",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  leads: [],
  settings: {
    email_admin: "Leonardolnex@gmail.com",
    whatsapp_number: "+15709144529",
    social_links: {
      facebook: "https://facebook.com/codedesignla",
      instagram: "https://instagram.com/codedesignla",
      twitter: "https://twitter.com/codedesignla",
      threads: "https://threads.net/codedesignla",
    },
  },
  metrics: {
    projects_delivered: 50,
    years_experience: 5,
    active_countries: 10,
    visits_total: 0,
  },
};
