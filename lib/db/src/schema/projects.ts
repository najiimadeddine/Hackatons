import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hackathonsTable } from "./hackathons";
import { teamsTable } from "./teams";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  hackathonId: integer("hackathon_id").notNull().references(() => hackathonsTable.id),
  teamId: integer("team_id").notNull().references(() => teamsTable.id),
  title: text("title").notNull(),
  description: text("description"),
  readmeMarkdown: text("readme_markdown"),
  repoUrl: text("repo_url"),
  demoUrl: text("demo_url"),
  videoUrl: text("video_url"),
  techStack: text("tech_stack").array().notNull().default([]),
  status: text("status", { enum: ["draft", "submitted", "under_review", "winner", "finalist"] }).notNull().default("draft"),
  totalScore: real("total_score"),
  rank: integer("rank"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const evaluationCriteriaTable = pgTable("evaluation_criteria", {
  id: serial("id").primaryKey(),
  hackathonId: integer("hackathon_id").notNull().references(() => hackathonsTable.id),
  name: text("name").notNull(),
  description: text("description"),
  weight: real("weight").notNull(),
  maxScore: integer("max_score").notNull().default(10),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const evaluationsTable = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id),
  juryId: integer("jury_id").notNull(),
  totalScore: real("total_score").notNull(),
  feedback: text("feedback").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const evaluationScoresTable = pgTable("evaluation_scores", {
  id: serial("id").primaryKey(),
  evaluationId: integer("evaluation_id").notNull().references(() => evaluationsTable.id),
  criterionId: integer("criterion_id").notNull().references(() => evaluationCriteriaTable.id),
  score: real("score").notNull(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true, updatedAt: true, submittedAt: true, totalScore: true, rank: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
