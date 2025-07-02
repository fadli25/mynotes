"use server";

import { db } from "@/db/drizzle";
import { notes, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";

export async function createNote(formData: FormData) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  try {
    // Get user ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      throw new Error("User not found");
    }

    // Create note
    await db.insert(notes).values({
      title,
      content,
      userId: user[0].id,
    });

    revalidatePath("/dashboard");
  } catch (error) {
    throw error;
  }
}

export async function deleteNote(noteId: number) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  try {
    // Get user ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      throw new Error("User not found");
    }

    // Delete note only if it belongs to the current user
    const deletedNote = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, user[0].id)))
      .returning();

    if (deletedNote.length === 0) {
      throw new Error("Note not found or unauthorized");
    }

    revalidatePath("/dashboard");
  } catch (error) {
    throw error;
  }
}

export async function getUserNotes() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  try {
    // Get user ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      return [];
    }

    // Get user's notes
    const userNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, user[0].id));

    return userNotes;
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
}
