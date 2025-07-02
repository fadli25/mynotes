import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Input validation function
function validateSignupInput(name: string, email: string, password: string) {
  const errors: string[] = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (!email || !email.includes("@")) {
    errors.push("Please provide a valid email address");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  return errors;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validate input
    const validationErrors = validateSignupInput(name, email, password);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { message: "Validation failed", errors: validationErrors },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail));

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("unique constraint")) {
        return NextResponse.json(
          { message: "User with this email already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "An error occurred while creating your account. Please try again.",
      },
      { status: 500 }
    );
  }
}
