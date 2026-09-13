import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name must not exceed 60 characters"),
    email: z
      .string()
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must not exceed 72 characters")
      .regex(
        /^(?=.*[a-zA-Z])(?=.*[0-9])/,
        "Password must contain at least one letter and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      return NextResponse.json(
        {
          error: "Validation failed",
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check for existing user with identical email (case-insensitive)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email address already exists.",
          code: "EMAIL_ALREADY_EXISTS",
        },
        { status: 409 }
      );
    }

    // Salt and hash the password with bcrypt (12 rounds)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "An error occurred during registration. Please try again later.",
      },
      { status: 500 }
    );
  }
}
