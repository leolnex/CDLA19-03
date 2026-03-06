import { NextResponse } from "next/server";
import { updateProject, deleteProject } from "@/lib/data";

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
        { error: "Invalid project id" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const project = await updateProject(String(id), body);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update project" },
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
        { error: "Invalid project id" },
        { status: 400 },
      );
    }

    const success = await deleteProject(String(id));

    if (!success) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete project" },
      { status: 500 },
    );
  }
}
