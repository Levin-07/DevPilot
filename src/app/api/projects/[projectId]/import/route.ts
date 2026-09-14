import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { processZipArchive } from "@/lib/ingestion/service";
import { MAX_ZIP_SIZE } from "@/lib/ingestion/constants";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to import code." },
        { status: 401 }
      );
    }

    const { projectId } = await context.params;
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Project ID is required." },
        { status: 400 }
      );
    }

    // 2. Strict tenant authorization check
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found or you do not have permission to modify it.",
        },
        { status: 403 }
      );
    }

    // 3. Extract and validate multipart form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "No ZIP file provided in upload request." },
        { status: 400 }
      );
    }

    const fileName = file instanceof File ? file.name : "archive.zip";
    const isZip =
      fileName.toLowerCase().endsWith(".zip") ||
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed";

    if (!isZip) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file format. Only .zip archives are supported for codebase ingestion.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_ZIP_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `Archive exceeds maximum upload limit of ${MAX_ZIP_SIZE / (1024 * 1024)}MB.`,
        },
        { status: 413 }
      );
    }

    // 4. Convert to Buffer and process archive
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await processZipArchive(projectId, session.user.id, buffer);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to process codebase archive.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 422 }
    );
  }
}
