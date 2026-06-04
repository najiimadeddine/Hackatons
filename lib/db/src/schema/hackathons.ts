import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const hackathonsTable = pgTable("hackathons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["draft", "open", "active", "judging", "completed", "cancelled"] }).notNull().default("draft"),
  bannerUrl: text("banner_url"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  registrationDeadline: timestamp("registration_deadline", { withTimezone: true }),
  maxTeamSize: integer("max_team_size").notNull().default(4),
  minTeamSize: integer("min_team_size").notNull().default(1),
  maxParticipants: integer("max_participants"),
  prizePool: text("prize_pool"),
  techStack: text("tech_stack").array().notNull().default([]),
  organizerId: integer("organizer_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const hackathonParticipantsTable = pgTable("hackathon_participants", {
  id: serial("id").primaryKey(),
  hackathonId: integer("hackathon_id").notNull().references(() => hackathonsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export const hackathonRolesTable = pgTable("hackathon_roles", {
  id: serial("id").primaryKey(),
  hackathonId: integer("hackathon_id").notNull().references(() => hackathonsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  role: text("role", { enum: ["mentor", "jury"] }).notNull(),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
});

export const milestonesTable = pgTable("milestones", {
  id: serial("id").primaryKey(),
  hackathonId: integer("hackathon_id").notNull().references(() => hackathonsTable.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  isCompleted: text("is_completed").notNull().default("false"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHackathonSchema = createInsertSchema(hackathonsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHackathon = z.infer<typeof insertHackathonSchema>;
export type Hackathon = typeof hackathonsTable.$inferSelect;
