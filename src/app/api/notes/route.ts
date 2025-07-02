import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/db/drizzle";
import { notes, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, user[0].id));

    return NextResponse.json({ notes: userNotes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { message: "Error fetching notes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and content are required" },
        { status: 400 }
      );
    }

    // Get user ID from email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const newNote = await db
      .insert(notes)
      .values({
        title,
        content,
        userId: user[0].id,
      })
      .returning();

    return NextResponse.json({ note: newNote[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { message: "Error creating note" },
      { status: 500 }
    );
  }
}
