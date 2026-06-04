import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { hackathonsTable } from "./hackathons";

export const teamsTable = pgTable("teams", {
  id: serial("id").primaryKey(),
  hackathonId: integer("hackathon_id").notNull().references(() => hackathonsTable.id),
  name: text("name").notNull(),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  lookingForRoles: text("looking_for_roles").array().notNull().default([]),
  leaderId: integer("leader_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const teamMembersTable = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teamsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamInvitationsTable = pgTable("team_invitations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teamsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  message: text("message"),
  status: text("status", { enum: ["pending", "accepted", "declined"] }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const matchSwipesTable = pgTable("match_swipes", {
  id: serial("id").primaryKey(),
  hackathonId: integer("hackathon_id").notNull().references(() => hackathonsTable.id),
  fromUserId: integer("from_user_id").notNull().references(() => usersTable.id),
  toUserId: integer("to_user_id").notNull().references(() => usersTable.id),
  direction: text("direction", { enum: ["left", "right"] }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teamsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teamsTable.$inferSelect;
