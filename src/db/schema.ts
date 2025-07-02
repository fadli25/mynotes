import { pgTable, serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: serial("name").notNull(),
  email: serial("email").notNull().unique(),
  password: serial("password").notNull(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: serial("title").notNull(),
  content: serial("content").notNull(),
  userId: serial("user_id")
    .references(() => users.id)
    .notNull(),
});
