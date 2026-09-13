import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("-----------------------------------------");
  console.log("  DevPilot PostgreSQL Connectivity Test  ");
  console.log("-----------------------------------------");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ Error: DATABASE_URL is not set in environment.");
    process.exit(1);
  }

  // Mask password for safe logging
  const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ":****@");
  console.log(`Connecting to: ${maskedUrl}`);

  const start = Date.now();
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected, version() as version;`;
    const latency = Date.now() - start;
    console.log("✅ Database connection successful!");
    console.log(`⏱️ Latency: ${latency}ms`);
    console.log(`📦 PostgreSQL Version:`, result[0]?.version);
    
    // Check if pgvector extension is installed
    try {
      const extResult = await prisma.$queryRaw`SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';`;
      if (extResult && extResult.length > 0) {
        console.log(`✨ pgvector extension: active (v${extResult[0].extversion})`);
      } else {
        console.log("ℹ️ pgvector extension: not yet loaded (run migrations or CREATE EXTENSION vector;)");
      }
    } catch {
      console.log("ℹ️ pgvector extension check skipped.");
    }

  } catch (error) {
    console.error("❌ Connection failed!");
    console.error("Details:", error.message);
    console.log("\nTroubleshooting tips:");
    console.log("1. Verify your credentials in .env (DATABASE_URL)");
    console.log("2. If using Docker: docker compose up -d");
    console.log("3. If using local PostgreSQL: ensure service is running and password matches");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
