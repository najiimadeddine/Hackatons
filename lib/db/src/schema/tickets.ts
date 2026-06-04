import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { hackathonsTable } from "./hackathons";

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  hackathonId: integer("hackathon_id").notNull().references(() => hackathonsTable.id),
  authorId: integer("author_id").notNull().references(() => usersTable.id),
  mentorId: integer("mentor_id").references(() => usersTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["open", "claimed", "resolved", "closed"] }).notNull().default("open"),
  priority: text("priority", { enum: ["low", "medium", "high"] }).notNull().default("medium"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({ id: true, createdAt: true, updatedAt: true, resolvedAt: true, mentorId: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
