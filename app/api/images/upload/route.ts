export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { executeQuery } from "@/lib/mysql";

// Image dimensions based on role
const IMAGE_SPECS: Record<string, { width: number; height: number }> = {
  service_hero: { width: 1200, height: 1200 }, // 1:1
  project_cover: { width: 1600, height: 1000 }, // 16:10
  project_gallery: { width: 1200, height: 1200 }, // 1:1
};

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const ownerType = formData.get("owner_type") as string | null;
    const role = formData.get("role") as string | null;
    const slotStr = formData.get("slot") as string | null;
    const ownerIdStr = formData.get("owner_id") as string | null;

    if (!file) {
      return NextResponse.json({ error: "file_required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "invalid_file_type" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "file_too_large", max: MAX_FILE_SIZE },
        { status: 400 },
      );
    }

    if (!ownerType || !["service", "project"].includes(ownerType)) {
      return NextResponse.json(
        { error: "invalid_owner_type" },
        { status: 400 },
      );
    }

    if (
      !role ||
      !["service_hero", "project_cover", "project_gallery"].includes(role)
    ) {
      return NextResponse.json({ error: "invalid_role" }, { status: 400 });
    }

    let slot: number | null = null;
    if (role === "service_hero") {
      if (!slotStr) {
        return NextResponse.json(
          { error: "slot_required_for_hero" },
          { status: 400 },
        );
      }

      slot = parseInt(slotStr, 10);
      if (isNaN(slot) || slot < 1 || slot > 4) {
        return NextResponse.json(
          { error: "invalid_slot", expected: "1-4" },
          { status: 400 },
        );
      }
    }

    const ownerId = ownerIdStr ? parseInt(ownerIdStr, 10) : null;

    const specs = IMAGE_SPECS[role];
    if (!specs) {
      return NextResponse.json({ error: "unknown_role" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const processedImage = await sharp(inputBuffer)
      .resize(specs.width, specs.height, {
        fit: "cover",
        position: "centre",
      })
      .webp({ quality: 85 })
      .toBuffer();

    const result: any = await executeQuery(
      `
      INSERT INTO cdla_images
      (owner_type, owner_id, role, slot, mime_type, width, height, bytes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        ownerType,
        ownerId,
        role,
        slot,
        "image/webp",
        specs.width,
        specs.height,
        processedImage,
      ],
    );

    const imageId = result.insertId as number;

    return NextResponse.json({
      image_id: imageId,
      url: `/api/images/${imageId}`,
      width: specs.width,
      height: specs.height,
      mime_type: "image/webp",
    });
  } catch (error) {
    console.error("[CDLA] Image upload error:", error);

    return NextResponse.json(
      {
        error: "upload_failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
