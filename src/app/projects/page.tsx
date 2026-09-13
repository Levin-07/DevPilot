import React from "react";
import { getUserProjects } from "@/actions/projects";
import { ProjectsList } from "@/components/projects/ProjectsList";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const result = await getUserProjects();
  const projects = result.success ? result.projects : [];

  return <ProjectsList initialProjects={projects} />;
}
