import { Router } from "express";
import { db, usersTable, auditLogsTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/users", authenticate, async (req, res) => {
  const role = req.query.role as string | undefined;
  const search = req.query.search as string | undefined;
  const pageNum = parseInt((req.query.page as string) ?? "1", 10);
  const limitNum = Math.min(parseInt((req.query.limit as string) ?? "20", 10), 100);
  const offset = (pageNum - 1) * limitNum;

  const baseQuery = db.select({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    role: usersTable.role,
    isActive: usersTable.isActive,
    bio: usersTable.bio,
    avatarUrl: usersTable.avatarUrl,
    skills: usersTable.skills,
    timezone: usersTable.timezone,
    githubUrl: usersTable.githubUrl,
    linkedinUrl: usersTable.linkedinUrl,
    createdAt: usersTable.createdAt,
  }).from(usersTable).$dynamic();

  const filtered = role
    ? baseQuery.where(eq(usersTable.role, role as "participant" | "organizer" | "mentor" | "jury" | "admin"))
    : search
    ? baseQuery.where(or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`)))
    : baseQuery;

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const users = await filtered.limit(limitNum).offset(offset);
  res.json({ data: users.map(u => ({ ...u, skills: u.skills ?? [] })), total: count, page: pageNum, limit: limitNum });
});

router.get("/users/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const [user] = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    role: usersTable.role,
    isActive: usersTable.isActive,
    bio: usersTable.bio,
    avatarUrl: usersTable.avatarUrl,
    skills: usersTable.skills,
    timezone: usersTable.timezone,
    githubUrl: usersTable.githubUrl,
    linkedinUrl: usersTable.linkedinUrl,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ ...user, skills: user.skills ?? [] });
});

router.patch("/users/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (req.user!.userId !== id && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { name, bio, avatarUrl, skills, timezone, githubUrl, linkedinUrl } = req.body as {
    name?: string; bio?: string; avatarUrl?: string; skills?: string[];
    timezone?: string; githubUrl?: string; linkedinUrl?: string;
  };
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (skills !== undefined) updates.skills = skills;
  if (timezone !== undefined) updates.timezone = timezone;
  if (githubUrl !== undefined) updates.githubUrl = githubUrl;
  if (linkedinUrl !== undefined) updates.linkedinUrl = linkedinUrl;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const { passwordHash: _, ...safeUser } = user;
  res.json({ ...safeUser, skills: safeUser.skills ?? [] });
});

router.patch("/users/:id/toggle-status", authenticate, requireRole("admin"), async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "User not found" }); return; }
  const [user] = await db.update(usersTable).set({ isActive: !existing.isActive }).where(eq(usersTable.id, id)).returning();
  await db.insert(auditLogsTable).values({
    userId: req.user!.userId,
    action: user.isActive ? "USER_ACTIVATED" : "USER_BANNED",
    details: `Admin toggled user ${id} status to ${user.isActive ? "active" : "banned"}`,
    ipAddress: req.ip ?? null,
  });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ ...safeUser, skills: safeUser.skills ?? [] });
});

export default router;
