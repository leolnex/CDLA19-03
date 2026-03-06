import { NextResponse } from "next/server";
import {
  getProjects,
  getPublishedProjects,
  getFeaturedProjects,
  createProject,
  searchProjects,
} from "@/lib/data";

/**
 * Acepta categorías desde UI/URL y las mapea a como están en DB.
 * Soporta variantes legacy: app_movil, app-movil, etc.
 */
function mapCategoryToDb(value: string | null): string | undefined {
  if (!value) return undefined;
  const v = value.toLowerCase().trim();

  if (!v || v === "todos") return undefined;

  if (v === "app_movil" || v === "appmovil" || v === "app-movil")
    return "app-movil";
  if (v === "website" || v === "web") return "website";
  if (v === "logo") return "logo";
  if (v === "redes" || v.includes("red")) return "redes";
  if (v === "tarjetas" || v.includes("tarjet")) return "tarjetas";
  if (v === "otros" || v.includes("otro")) return "otros";

  // fallback: deja pasar lo que venga
  return v;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // comportamiento existente (admin / destacados)
  const all = searchParams.get("all") === "true";
  const featured = searchParams.get("featured") === "true";

  // 🔎 búsqueda PRO
  const q = (searchParams.get("q") ?? "").trim();

  // soporta ?categoria= y también ?category=
  const categoriaRaw =
    searchParams.get("categoria") ?? searchParams.get("category");
  const categoriaDb = mapCategoryToDb(categoriaRaw);

  // Si viene q o categoria (y NO es all/featured), usar búsqueda SQL publicada
  if (!all && !featured && (q.length > 0 || !!categoriaDb)) {
    try {
      const projects = await searchProjects(q, categoriaDb);
      return NextResponse.json(projects, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error: any) {
      console.error("Error searching projects:", error);
      return NextResponse.json(
        { error: error?.message || "Failed to search projects" },
        { status: 500 },
      );
    }
  }

  // fallback normal
  let projects;
  if (featured) {
    projects = await getFeaturedProjects();
  } else if (all) {
    projects = await getProjects();
  } else {
    projects = await getPublishedProjects();
  }

  return NextResponse.json(projects, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const project = await createProject(body);
    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create project" },
      { status: 500 },
    );
  }
}
