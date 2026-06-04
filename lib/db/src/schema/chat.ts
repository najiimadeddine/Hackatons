import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { hackathonsTable } from "./hackathons";
import { teamsTable } from "./teams";

export const chatRoomsTable = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["team", "announcement", "support", "general"] }).notNull(),
  hackathonId: integer("hackathon_id").notNull().references(() => hackathonsTable.id),
  teamId: integer("team_id").references(() => teamsTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatMessagesTable = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRoomsTable.id),
  senderId: integer("sender_id").notNull().references(() => usersTable.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessagesTable).omit({ id: true, createdAt: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
