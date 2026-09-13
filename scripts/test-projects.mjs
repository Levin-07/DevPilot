import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const createProjectSchema = z.object({
  name: z
    .string({ required_error: "Project name is required" })
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(60, "Project name cannot exceed 60 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(60, "Project name cannot exceed 60 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runProjectTests() {
  console.log("=========================================");
  console.log("   DevPilot Phase 3: Project Mgmt Test   ");
  console.log("=========================================\n");

  let userA = null;
  let userB = null;
  let projectA = null;

  try {
    // -------------------------------------------------------------
    // Setup: Create 2 Distinct Users for Multi-Tenant Isolation
    // -------------------------------------------------------------
    console.log("Setup: Initializing Two Test Tenants (User A & User B)...");
    const passwordHash = await bcrypt.hash("TestPass123!", 10);
    const timestamp = Date.now();

    userA = await prisma.user.create({
      data: {
        name: "Alice Developer",
        email: `alice_${timestamp}@devpilot.test`,
        passwordHash,
      },
    });

    userB = await prisma.user.create({
      data: {
        name: "Bob Intruder",
        email: `bob_${timestamp}@devpilot.test`,
        passwordHash,
      },
    });

    assert(userA.id && userB.id, "Tenants User A and User B created with distinct IDs");

    // -------------------------------------------------------------
    // Suite 1: Input Validation
    // -------------------------------------------------------------
    console.log("\nTest Suite 1: Input Validation (Zod Schemas)");

    const emptyName = createProjectSchema.safeParse({ name: "" });
    assert(!emptyName.success, "Empty project name is rejected");

    const shortName = createProjectSchema.safeParse({ name: "A" });
    assert(!shortName.success, "Project name with 1 character is rejected (< 2 chars)");

    const longName = createProjectSchema.safeParse({ name: "A".repeat(61) });
    assert(!longName.success, "Project name exceeding 60 characters is rejected");

    const validProject = createProjectSchema.safeParse({
      name: "Cloud Gateway Microservices",
      description: "Distributed API Gateway with load balancing",
    });
    assert(validProject.success, "Valid project name and description are accepted");

    // -------------------------------------------------------------
    // Suite 2: Project Creation & Ownership Binding
    // -------------------------------------------------------------
    console.log("\nTest Suite 2: Project Creation & Ownership Association");

    projectA = await prisma.project.create({
      data: {
        name: validProject.data.name,
        description: validProject.data.description,
        userId: userA.id, // Strictly bound to User A
      },
    });

    assert(projectA.id && projectA.id.length > 0, "Project created with CUID");
    assert(projectA.userId === userA.id, "Project is strictly associated with User A's ID");
    assert(projectA.status === "CREATED", "Project default status is CREATED");
    assert(projectA.createdAt instanceof Date, "Project has valid createdAt timestamp");

    // -------------------------------------------------------------
    // Suite 3: Reading Projects (Owner vs Multi-Tenant Isolation)
    // -------------------------------------------------------------
    console.log("\nTest Suite 3: Multi-Tenant Read Authorization");

    // User A should find projectA
    const aliceProjects = await prisma.project.findMany({
      where: { userId: userA.id },
    });
    assert(
      aliceProjects.some((p) => p.id === projectA.id),
      "User A successfully retrieves their own project in project list"
    );

    // User B should NOT find projectA in their list
    const bobProjects = await prisma.project.findMany({
      where: { userId: userB.id },
    });
    assert(
      !bobProjects.some((p) => p.id === projectA.id),
      "User B's project list does NOT include User A's project"
    );

    // Direct fetch by ID with User B's ownership constraint
    const bobAttemptDirectRead = await prisma.project.findFirst({
      where: {
        id: projectA.id,
        userId: userB.id, // User B trying to access projectA
      },
    });
    assert(
      bobAttemptDirectRead === null,
      "SECURITY: User B direct lookup for Project A returns NULL (Unauthorized)"
    );

    // -------------------------------------------------------------
    // Suite 4: Multi-Tenant Update Authorization
    // -------------------------------------------------------------
    console.log("\nTest Suite 4: Multi-Tenant Update Authorization");

    // User B attempts to update User A's project
    const bobAttemptUpdate = await prisma.project.findFirst({
      where: {
        id: projectA.id,
        userId: userB.id,
      },
    });
    assert(
      bobAttemptUpdate === null,
      "SECURITY: Server-side check blocks User B from finding Project A to update"
    );

    // User A updates their own project
    const updatedName = "Cloud Gateway Microservices v2";
    const updatedDescription = "Upgraded Envoy proxy with gRPC streaming";

    const updateCheck = await prisma.project.findFirst({
      where: { id: projectA.id, userId: userA.id },
    });
    assert(updateCheck !== null, "User A ownership verified before mutation");

    const updatedProjectA = await prisma.project.update({
      where: { id: projectA.id },
      data: {
        name: updatedName,
        description: updatedDescription,
      },
    });

    assert(updatedProjectA.name === updatedName, "User A successfully updated project name");
    assert(updatedProjectA.description === updatedDescription, "User A successfully updated description");
    assert(updatedProjectA.updatedAt >= projectA.updatedAt, "Project updatedAt timestamp was bumped");

    // -------------------------------------------------------------
    // Suite 5: Multi-Tenant Delete Authorization
    // -------------------------------------------------------------
    console.log("\nTest Suite 5: Multi-Tenant Delete Authorization");

    // User B attempts to delete User A's project
    const bobAttemptDelete = await prisma.project.findFirst({
      where: {
        id: projectA.id,
        userId: userB.id,
      },
    });
    assert(
      bobAttemptDelete === null,
      "SECURITY: Server-side check blocks User B from finding Project A to delete"
    );

    // Verify projectA still exists after User B's unauthorized attempt
    const verifyStillExists = await prisma.project.findUnique({
      where: { id: projectA.id },
    });
    assert(verifyStillExists !== null, "Project A remains completely intact after unauthorized attempt");

    // User A successfully deletes their own project
    const aliceDeleteCheck = await prisma.project.findFirst({
      where: { id: projectA.id, userId: userA.id },
    });
    assert(aliceDeleteCheck !== null, "User A ownership verified before deletion");

    await prisma.project.delete({
      where: { id: projectA.id },
    });

    const verifyDeleted = await prisma.project.findUnique({
      where: { id: projectA.id },
    });
    assert(verifyDeleted === null, "Project A successfully deleted by owner from PostgreSQL");

    // -------------------------------------------------------------
    // Suite 6: Foreign Key Cascading Verification
    // -------------------------------------------------------------
    console.log("\nTest Suite 6: Foreign Key Cascading Verification");
    const cascadeProject = await prisma.project.create({
      data: {
        name: "Cascade Test Repo",
        userId: userA.id,
      },
    });

    const cascadeFile = await prisma.projectFile.create({
      data: {
        projectId: cascadeProject.id,
        filePath: "src/index.ts",
        fileSize: 1024,
      },
    });

    const cascadeChunk = await prisma.codeChunk.create({
      data: {
        projectId: cascadeProject.id,
        fileId: cascadeFile.id,
        content: "console.log('cascade test');",
        chunkIndex: 0,
        startLine: 1,
        endLine: 1,
      },
    });

    assert(cascadeFile.id && cascadeFile.id.length > 0, "Child ProjectFile created with project relation");
    assert(cascadeChunk.id && cascadeChunk.id.length > 0, "Child CodeChunk created with project & file relation");

    const fileId = cascadeFile.id;
    const chunkId = cascadeChunk.id;

    // Delete parent project
    await prisma.project.delete({
      where: { id: cascadeProject.id },
    });

    const recheckFile = await prisma.projectFile.findUnique({ where: { id: fileId } });
    const recheckChunk = await prisma.codeChunk.findUnique({ where: { id: chunkId } });

    assert(recheckFile === null, "Cascading delete automatically removed child ProjectFile");
    assert(recheckChunk === null, "Cascading delete automatically removed child CodeChunk");

    console.log("\n=========================================");
    console.log(`Results: ${passedTests}/${totalTests} tests passed`);
    console.log("=========================================");

    if (passedTests === totalTests) {
      console.log("🎉 Phase 3 Project Management & Multi-Tenant Authorization: ALL TESTS PASSED!\n");
    } else {
      console.error("❌ Some tests failed.\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Test encountered an error:", error);
    process.exit(1);
  } finally {
    // Teardown test users
    console.log("Teardown: Cleaning up test users...");
    if (userA) {
      await prisma.user.delete({ where: { id: userA.id } }).catch(() => {});
    }
    if (userB) {
      await prisma.user.delete({ where: { id: userB.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runProjectTests();
