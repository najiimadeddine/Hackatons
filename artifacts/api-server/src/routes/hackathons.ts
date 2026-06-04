import { Router } from "express";
import {
  db, hackathonsTable, hackathonParticipantsTable, hackathonRolesTable,
  milestonesTable, evaluationCriteriaTable, auditLogsTable,
} from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/hackathons", async (req, res) => {
  const status = req.query.status as string | undefined;
  const pageNum = parseInt((req.query.page as string) ?? "1", 10);
  const limitNum = Math.min(parseInt((req.query.limit as string) ?? "20", 10), 100);
  const offset = (pageNum - 1) * limitNum;

  const baseQ = db.select().from(hackathonsTable).$dynamic();
  const filtered = status
    ? baseQ.where(eq(hackathonsTable.status, status as "draft" | "open" | "active" | "judging" | "completed" | "cancelled"))
    : baseQ;
  const rows = await filtered.limit(limitNum).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(hackathonsTable);

  const enriched = await Promise.all(rows.map(async (h) => {
    const [{ pCount }] = await db.select({ pCount: sql<number>`count(*)::int` })
      .from(hackathonParticipantsTable).where(eq(hackathonParticipantsTable.hackathonId, h.id));
    return { ...h, techStack: h.techStack ?? [], participantCount: pCount, teamCount: 0, projectCount: 0 };
  }));

  res.json({ data: enriched, total: count, page: pageNum, limit: limitNum });
});

router.post("/hackathons", authenticate, requireRole("organizer", "admin"), async (req, res) => {
  const { title, description, startDate, endDate, registrationDeadline, maxTeamSize, minTeamSize, maxParticipants, prizePool, techStack, bannerUrl } = req.body as {
    title: string; description: string; startDate: string; endDate: string;
    registrationDeadline?: string; maxTeamSize?: number; minTeamSize?: number;
    maxParticipants?: number; prizePool?: string; techStack?: string[]; bannerUrl?: string;
  };
  const [h] = await db.insert(hackathonsTable).values({
    title, description,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
    maxTeamSize: maxTeamSize ?? 4,
    minTeamSize: minTeamSize ?? 1,
    maxParticipants: maxParticipants ?? null,
    prizePool: prizePool ?? null,
    techStack: techStack ?? [],
    bannerUrl: bannerUrl ?? null,
    organizerId: req.user!.userId,
    status: "draft",
  }).returning();
  await db.insert(auditLogsTable).values({ userId: req.user!.userId, action: "HACKATHON_CREATED", details: `Created hackathon: ${title}`, ipAddress: req.ip ?? null });
  res.status(201).json({ ...h, techStack: h.techStack ?? [], participantCount: 0, teamCount: 0, projectCount: 0 });
});

router.get("/hackathons/:id", async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const [h] = await db.select().from(hackathonsTable).where(eq(hackathonsTable.id, id)).limit(1);
  if (!h) { res.status(404).json({ error: "Hackathon not found" }); return; }
  const [{ pCount }] = await db.select({ pCount: sql<number>`count(*)::int` })
    .from(hackathonParticipantsTable).where(eq(hackathonParticipantsTable.hackathonId, id));
  res.json({ ...h, techStack: h.techStack ?? [], participantCount: pCount, teamCount: 0, projectCount: 0 });
});

router.patch("/hackathons/:id", authenticate, requireRole("organizer", "admin"), async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const updates: Partial<typeof hackathonsTable.$inferInsert> = {};
  const b = req.body as Record<string, unknown>;
  if (b.title) updates.title = String(b.title);
  if (b.description) updates.description = String(b.description);
  if (b.status) updates.status = b.status as "draft" | "open" | "active" | "judging" | "completed" | "cancelled";
  if (b.startDate) updates.startDate = new Date(String(b.startDate));
  if (b.endDate) updates.endDate = new Date(String(b.endDate));
  if (b.registrationDeadline !== undefined) updates.registrationDeadline = b.registrationDeadline ? new Date(String(b.registrationDeadline)) : null;
  if (b.maxTeamSize) updates.maxTeamSize = Number(b.maxTeamSize);
  if (b.minTeamSize) updates.minTeamSize = Number(b.minTeamSize);
  if (b.maxParticipants !== undefined) updates.maxParticipants = b.maxParticipants ? Number(b.maxParticipants) : null;
  if (b.prizePool !== undefined) updates.prizePool = b.prizePool ? String(b.prizePool) : null;
  if (b.techStack) updates.techStack = b.techStack as string[];
  if (b.bannerUrl !== undefined) updates.bannerUrl = b.bannerUrl ? String(b.bannerUrl) : null;
  const [h] = await db.update(hackathonsTable).set(updates).where(eq(hackathonsTable.id, id)).returning();
  if (!h) { res.status(404).json({ error: "Hackathon not found" }); return; }
  res.json({ ...h, techStack: h.techStack ?? [], participantCount: 0, teamCount: 0, projectCount: 0 });
});

router.delete("/hackathons/:id", authenticate, requireRole("organizer", "admin"), async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  await db.delete(hackathonsTable).where(eq(hackathonsTable.id, id));
  await db.insert(auditLogsTable).values({ userId: req.user!.userId, action: "HACKATHON_DELETED", details: `Deleted hackathon ${id}`, ipAddress: req.ip ?? null });
  res.json({ success: true, message: "Hackathon deleted" });
});

router.post("/hackathons/:id/register", authenticate, async (req, res) => {
  const hackathonId = parseInt(req.params.id as string, 10);
  const userId = req.user!.userId;
  const existing = await db.select().from(hackathonParticipantsTable)
    .where(and(eq(hackathonParticipantsTable.hackathonId, hackathonId), eq(hackathonParticipantsTable.userId, userId))).limit(1);
  if (existing.length === 0) {
    await db.insert(hackathonParticipantsTable).values({ hackathonId, userId });
  }
  res.json({ success: true, message: "Registered for hackathon" });
});

router.post("/hackathons/:id/assign-role", authenticate, requireRole("organizer", "admin"), async (req, res) => {
  const hackathonId = parseInt(req.params.id as string, 10);
  const { userId, role } = req.body as { userId: number; role: "mentor" | "jury" };
  const existing = await db.select().from(hackathonRolesTable)
    .where(and(eq(hackathonRolesTable.hackathonId, hackathonId), eq(hackathonRolesTable.userId, userId))).limit(1);
  if (existing.length === 0) {
    await db.insert(hackathonRolesTable).values({ hackathonId, userId, role });
  } else {
    await db.update(hackathonRolesTable).set({ role }).where(and(eq(hackathonRolesTable.hackathonId, hackathonId), eq(hackathonRolesTable.userId, userId)));
  }
  res.json({ success: true, message: "Role assigned" });
});

router.get("/hackathons/:id/milestones", async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const milestones = await db.select().from(milestonesTable).where(eq(milestonesTable.hackathonId, id));
  res.json(milestones.map(m => ({ ...m, isCompleted: m.isCompleted === "true" })));
});

router.post("/hackathons/:id/milestones", authenticate, requireRole("organizer", "admin"), async (req, res) => {
  const hackathonId = parseInt(req.params.id as string, 10);
  const { title, description, dueDate } = req.body as { title: string; description?: string; dueDate: string };
  const [m] = await db.insert(milestonesTable).values({
    hackathonId, title,
    description: description ?? null,
    dueDate: new Date(dueDate),
  }).returning();
  res.status(201).json({ ...m, isCompleted: m.isCompleted === "true" });
});

router.get("/hackathons/:id/criteria", async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const criteria = await db.select().from(evaluationCriteriaTable).where(eq(evaluationCriteriaTable.hackathonId, id));
  res.json(criteria);
});

router.post("/hackathons/:id/criteria", authenticate, requireRole("organizer", "admin"), async (req, res) => {
  const hackathonId = parseInt(req.params.id as string, 10);
  const { name, description, weight, maxScore } = req.body as {
    name: string; description?: string; weight: number; maxScore?: number;
  };
  const [c] = await db.insert(evaluationCriteriaTable).values({
    hackathonId, name,
    description: description ?? null,
    weight, maxScore: maxScore ?? 10,
  }).returning();
  res.status(201).json(c);
});

export default router;
