import { Router } from "express";
import { db, ticketsTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.get("/tickets", authenticate, async (req, res) => {
  const status = req.query.status as string | undefined;
  const hackathonIdStr = req.query.hackathonId as string | undefined;
  const hackathonId = hackathonIdStr ? parseInt(hackathonIdStr, 10) : undefined;

  const tickets = await db.select({
    id: ticketsTable.id,
    hackathonId: ticketsTable.hackathonId,
    authorId: ticketsTable.authorId,
    mentorId: ticketsTable.mentorId,
    title: ticketsTable.title,
    description: ticketsTable.description,
    status: ticketsTable.status,
    priority: ticketsTable.priority,
    createdAt: ticketsTable.createdAt,
    resolvedAt: ticketsTable.resolvedAt,
  }).from(ticketsTable)
    .where(and(
      status ? eq(ticketsTable.status, status as "open" | "claimed" | "resolved" | "closed") : sql`true`,
      hackathonId ? eq(ticketsTable.hackathonId, hackathonId) : sql`true`,
    ));

  const enriched = await Promise.all(tickets.map(async (t) => {
    const [author] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, t.authorId)).limit(1);
    const mentor = t.mentorId ? await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, t.mentorId)).limit(1) : [];
    return { ...t, authorName: author?.name ?? "", mentorName: mentor[0]?.name ?? null };
  }));

  res.json(enriched);
});

router.post("/tickets", authenticate, async (req, res) => {
  const { hackathonId, title, description, priority } = req.body as {
    hackathonId: number; title: string; description: string; priority?: string;
  };
  const [ticket] = await db.insert(ticketsTable).values({
    hackathonId,
    authorId: req.user!.userId,
    title,
    description,
    priority: (priority ?? "medium") as "low" | "medium" | "high",
    status: "open",
  }).returning();
  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  res.status(201).json({ ...ticket, authorName: author?.name ?? "", mentorName: null });
});

router.get("/tickets/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, id)).limit(1);
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }
  const [author] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, ticket.authorId)).limit(1);
  const mentor = ticket.mentorId ? await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, ticket.mentorId)).limit(1) : [];
  res.json({ ...ticket, authorName: author?.name ?? "", mentorName: mentor[0]?.name ?? null });
});

router.patch("/tickets/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const { title, description, status, priority } = req.body as {
    title?: string; description?: string; status?: string; priority?: string;
  };
  const updates: Partial<typeof ticketsTable.$inferInsert> = {};
  if (title) updates.title = title;
  if (description) updates.description = description;
  if (status) updates.status = status as "open" | "claimed" | "resolved" | "closed";
  if (priority) updates.priority = priority as "low" | "medium" | "high";
  const [ticket] = await db.update(ticketsTable).set(updates).where(eq(ticketsTable.id, id)).returning();
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }
  res.json({ ...ticket, authorName: "", mentorName: null });
});

router.post("/tickets/:id/claim", authenticate, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const [ticket] = await db.update(ticketsTable).set({ status: "claimed", mentorId: req.user!.userId }).where(eq(ticketsTable.id, id)).returning();
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }
  const [mentor] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  res.json({ ...ticket, authorName: "", mentorName: mentor?.name ?? null });
});

router.post("/tickets/:id/resolve", authenticate, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const [ticket] = await db.update(ticketsTable).set({ status: "resolved", resolvedAt: new Date() }).where(eq(ticketsTable.id, id)).returning();
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }
  res.json({ ...ticket, authorName: "", mentorName: null });
});

export default router;
