import { NextResponse } from "next/server";
import { updateService, deleteService } from "@/lib/data";

export const runtime = "nodejs"; // mssql SOLO funciona bien en Node

function normalizeServiceUpdates(body: any) {
  // Acepta camelCase del frontend y lo convierte a snake_case que usa la DB
  const normalized = { ...body };

  if (body.customCategory !== undefined && body.custom_category === undefined) {
    normalized.custom_category = body.customCategory;
  }

  // Opcional: limpiar campos que no quieres mandar a DB
  delete normalized.customCategory;

  return normalized;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validación mínima
    const n = Number(id);
    if (!Number.isFinite(n)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const updates = normalizeServiceUpdates(body);

    const service = await updateService(id, updates);

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error: any) {
    console.error("Error updating service:", error);

    // Devuelve algo útil para debug (sin filtrar secretos)
    const message =
      typeof error?.message === "string" ? error.message : "Failed to update service";

    return NextResponse.json(
      { error: "Failed to update service", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const n = Number(id);
    if (!Number.isFinite(n)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const success = await deleteService(id);

    if (!success) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting service:", error);

    const message =
      typeof error?.message === "string" ? error.message : "Failed to delete service";

    return NextResponse.json(
      { error: "Failed to delete service", details: message },
      { status: 500 }
    );
  }
}