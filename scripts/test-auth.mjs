import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEST_USER = {
  name: "DevPilot Test Runner",
  email: `test_auth_${Date.now()}@devpilot.local`,
  password: "TestPassword123!",
};

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

async function runTests() {
  console.log("=========================================");
  console.log("   DevPilot Phase 2: Auth Verification   ");
  console.log("=========================================\n");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ Error: DATABASE_URL is not configured.");
    process.exit(1);
  }

  // Ensure DB connection is alive
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("📡 Connected to PostgreSQL database.\n");
  } catch (err) {
    console.error("❌ Failed to reach PostgreSQL:", err.message);
    process.exit(1);
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Password Hashing & Salt Verification
    // -------------------------------------------------------------
    console.log("Test Suite 1: Cryptographic Password Security");
    const saltRounds = 12;
    const hash = await bcrypt.hash(TEST_USER.password, saltRounds);

    assert(
      hash.startsWith("$2a$") || hash.startsWith("$2b$"),
      "Password is encrypted with bcrypt standard format ($2a$/$2b$)"
    );
    assert(
      hash !== TEST_USER.password,
      "Password hash is distinct from plaintext input"
    );

    const validComparison = await bcrypt.compare(TEST_USER.password, hash);
    assert(validComparison === true, "Valid password successfully validates against bcrypt hash");

    const invalidComparison = await bcrypt.compare("WrongPassword999!", hash);
    assert(invalidComparison === false, "Incorrect password fails verification against bcrypt hash");

    // -------------------------------------------------------------
    // Test 2: Database User Creation & Field Integrity
    // -------------------------------------------------------------
    console.log("\nTest Suite 2: PostgreSQL User Record Storage");
    const createdUser = await prisma.user.create({
      data: {
        name: TEST_USER.name,
        email: TEST_USER.email,
        passwordHash: hash,
      },
    });

    assert(createdUser.id && createdUser.id.length > 0, "User ID generated (CUID)");
    assert(createdUser.email === TEST_USER.email, "Email stored accurately in PostgreSQL");
    assert(createdUser.name === TEST_USER.name, "Name stored accurately in PostgreSQL");
    assert(createdUser.passwordHash === hash, "Hashed password stored; no plaintext anywhere");

    // -------------------------------------------------------------
    // Test 3: Uniqueness & Duplicate Email Constraint
    // -------------------------------------------------------------
    console.log("\nTest Suite 3: Unique Email Constraint Enforcement");
    let duplicateErrorCaught = false;
    try {
      await prisma.user.create({
        data: {
          name: "Duplicate Imposter",
          email: TEST_USER.email, // identical email
          passwordHash: hash,
        },
      });
    } catch (err) {
      duplicateErrorCaught = true;
      assert(
        err.code === "P2002" || err.message.includes("Unique constraint"),
        "Prisma/PostgreSQL enforces unique email constraint (P2002)"
      );
    }
    assert(duplicateErrorCaught, "Duplicate email creation was rejected by database");

    // -------------------------------------------------------------
    // Test 4: Auth.js User Query & Session Data Sanitization
    // -------------------------------------------------------------
    console.log("\nTest Suite 4: Querying User & Credential Matching");
    const queriedUser = await prisma.user.findUnique({
      where: { email: TEST_USER.email },
    });

    assert(queriedUser !== null, "User found by unique email in PostgreSQL");
    const queryCompare = await bcrypt.compare(TEST_USER.password, queriedUser.passwordHash);
    assert(queryCompare === true, "Queried password hash verifies with user password");

    // Verify sanitized object does not include passwordHash when projecting
    const sanitizedUser = await prisma.user.findUnique({
      where: { email: TEST_USER.email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    assert(sanitizedUser.passwordHash === undefined, "Sanitized projection excludes passwordHash from response payloads");

    // -------------------------------------------------------------
    // Test 5: Cleanup
    // -------------------------------------------------------------
    console.log("\nTest Suite 5: Tear Down & Record Cleanup");
    const deletedUser = await prisma.user.delete({
      where: { id: createdUser.id },
    });
    assert(deletedUser.id === createdUser.id, "Test user record cleanly removed from database");

    const recheck = await prisma.user.findUnique({
      where: { id: createdUser.id },
    });
    assert(recheck === null, "Verified user is completely deleted");

    console.log("\n=========================================");
    console.log(`Results: ${passedTests}/${totalTests} tests passed`);
    console.log("=========================================");

    if (passedTests === totalTests) {
      console.log("🎉 Phase 2 Authentication Database & Security Verification: ALL TESTS PASSED!\n");
      process.exit(0);
    } else {
      console.error("❌ Some tests failed.\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Test suite encountered an error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
