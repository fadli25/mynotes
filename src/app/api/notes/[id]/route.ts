import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/db/drizzle";
import { notes, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const noteId = parseInt(params.id);

    if (isNaN(noteId)) {
      return NextResponse.json({ message: "Invalid note ID" }, { status: 400 });
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

    // Delete note only if it belongs to the current user
    const deletedNote = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, user[0].id)))
      .returning();

    if (deletedNote.length === 0) {
      return NextResponse.json(
        { message: "Note not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { message: "Error deleting note" },
      { status: 500 }
    );
  }
}
