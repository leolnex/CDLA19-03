import { NextResponse } from "next/server";
import { updateService, deleteService } from "@/lib/data";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // ✅ FIX Next.js 16: params viene como Promise
    const { id } = await params;

    // Validación básica del id
    const n = Number(id);
    if (!Number.isFinite(n) || n <= 0) {
      return NextResponse.json(
        { error: "Invalid service id" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const service = await updateService(String(id), body);

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error: any) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update service" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // ✅ FIX Next.js 16: params viene como Promise
    const { id } = await params;

    const n = Number(id);
    if (!Number.isFinite(n) || n <= 0) {
      return NextResponse.json(
        { error: "Invalid service id" },
        { status: 400 },
      );
    }

    const success = await deleteService(String(id));

    if (!success) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete service" },
      { status: 500 },
    );
  }
}
