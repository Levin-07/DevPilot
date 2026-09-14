"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  createProjectSchema,
  updateProjectSchema,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/lib/validations/project";

/**
 * Ensures the request is authenticated and returns the current user ID.
 */
async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to manage projects.");
  }
  return session.user.id;
}

/**
 * Retrieve all projects owned by the currently authenticated user.
 */
export async function getUserProjects() {
  try {
    const userId = await requireAuth();

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { files: true, chunks: true },
        },
      },
    });

    return { success: true, projects };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch projects";
    return { success: false, error: message, projects: [] };
  }
}

/**
 * Retrieve a single project by ID, strictly enforcing that it belongs to the authenticated user.
 */
export async function getProjectById(projectId: string) {
  try {
    const userId = await requireAuth();

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId, // Authorization constraint: MUST match authenticated user
      },
      include: {
        _count: {
          select: { files: true, chunks: true },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      return {
        success: false,
        error: "Project not found or you do not have permission to view it.",
        project: null,
      };
    }

    return { success: true, project };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch project";
    return { success: false, error: message, project: null };
  }
}

/**
 * Create a new project for the authenticated user.
 */
export async function createProject(data: CreateProjectInput) {
  try {
    const userId = await requireAuth();

    const validated = createProjectSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid project data",
      };
    }

    const { name, description } = validated.data;

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        userId, // Bound to authenticated user
      },
    });

    revalidatePath("/projects");
    return { success: true, project };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create project";
    return { success: false, error: message };
  }
}

/**
 * Update project name and/or description, strictly verifying ownership.
 */
export async function updateProject(projectId: string, data: UpdateProjectInput) {
  try {
    const userId = await requireAuth();

    const validated = updateProjectSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid update data",
      };
    }

    // Explicit authorization check: verify project exists and belongs to user
    const existing = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Project not found or you do not have permission to update it.",
      };
    }

    const { name, description } = validated.data;

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name !== undefined ? name : existing.name,
        description: description !== undefined ? (description || null) : existing.description,
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    return { success: true, project: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update project";
    return { success: false, error: message };
  }
}

/**
 * Delete a project, strictly verifying ownership.
 * PostgreSQL foreign key cascading will delete associated ProjectFiles and CodeChunks.
 */
export async function deleteProject(projectId: string) {
  try {
    const userId = await requireAuth();

    // Explicit authorization check: verify project exists and belongs to user
    const existing = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Project not found or you do not have permission to delete it.",
      };
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete project";
    return { success: false, error: message };
  }
}

/**
 * Retrieve all indexed files for a project belonging to the authenticated user.
 * Excludes full file content for optimized tree-view performance.
 */
export async function getProjectFiles(projectId: string) {
  try {
    const userId = await requireAuth();

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });

    if (!project) {
      return { success: false, error: "Project not found or access denied.", files: [] };
    }

    const files = await prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { filePath: "asc" },
      select: {
        id: true,
        filePath: true,
        relativePath: true,
        filename: true,
        extension: true,
        language: true,
        fileSize: true,
        createdAt: true,
      },
    });

    return { success: true, files };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch files";
    return { success: false, error: message, files: [] };
  }
}

/**
 * Retrieve the full source code content for a specific file in a project,
 * verifying that the requesting user owns the parent project.
 */
export async function getProjectFileContent(projectId: string, fileId: string) {
  try {
    const userId = await requireAuth();

    const file = await prisma.projectFile.findFirst({
      where: {
        id: fileId,
        projectId,
        project: {
          userId,
        },
      },
    });

    if (!file) {
      return {
        success: false,
        error: "File not found or access denied.",
        file: null,
      };
    }

    return { success: true, file };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch file content";
    return { success: false, error: message, file: null };
  }
}

