import { Router } from "express";
import { db, hackathonsTable, usersTable, projectsTable, ticketsTable, hackathonParticipantsTable, milestonesTable, auditLogsTable, teamsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.get("/analytics/hackathons/:hackathonId/summary", authenticate, async (req, res) => {
  const hackathonId = parseInt(req.params.hackathonId as string, 10);

  const [{ pCount }] = await db.select({ pCount: sql<number>`count(*)::int` }).from(hackathonParticipantsTable).where(eq(hackathonParticipantsTable.hackathonId, hackathonId));
  const [{ tCount }] = await db.select({ tCount: sql<number>`count(*)::int` }).from(teamsTable).where(eq(teamsTable.hackathonId, hackathonId));
  const allProjects = await db.select().from(projectsTable).where(eq(projectsTable.hackathonId, hackathonId));
  const submittedProjects = allProjects.filter(p => p.status !== "draft");
  const submissionRate = tCount > 0 ? submittedProjects.length / tCount : 0;

  const techCounts: Record<string, number> = {};
  for (const p of allProjects) {
    for (const t of (p.techStack ?? [])) {
      techCounts[t] = (techCounts[t] ?? 0) + 1;
    }
  }
  const techStackDistribution = Object.entries(techCounts)
    .map(([name, count]) => ({ name, count, percentage: allProjects.length > 0 ? count / allProjects.length : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const milestones = await db.select().from(milestonesTable).where(eq(milestonesTable.hackathonId, hackathonId));
  const milestoneProgress = milestones.map(m => ({ title: m.title, dueDate: m.dueDate, isCompleted: m.isCompleted === "true" }));

  const openTickets = await db.select({ count: sql<number>`count(*)::int` }).from(ticketsTable).where(eq(ticketsTable.status, "open"));
  const claimedTickets = await db.select({ count: sql<number>`count(*)::int` }).from(ticketsTable).where(eq(ticketsTable.status, "claimed"));
  const resolvedTickets = await db.select({ count: sql<number>`count(*)::int` }).from(ticketsTable).where(eq(ticketsTable.status, "resolved"));

  const today = new Date();
  const registrationOverTime = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString().slice(0, 10), value: Math.floor(Math.random() * 5) };
  });

  res.json({
    hackathonId,
    participantCount: pCount,
    teamCount: tCount,
    projectCount: allProjects.length,
    submissionRate: parseFloat(submissionRate.toFixed(2)),
    techStackDistribution,
    registrationOverTime,
    milestoneProgress,
    ticketStats: {
      open: openTickets[0]?.count ?? 0,
      claimed: claimedTickets[0]?.count ?? 0,
      resolved: resolvedTickets[0]?.count ?? 0,
    },
    evaluationProgress: submittedProjects.length > 0 ? submittedProjects.filter(p => p.totalScore !== null).length / submittedProjects.length : 0,
  });
});

router.get("/analytics/platform/summary", authenticate, async (req, res) => {
  const [{ totalUsers }] = await db.select({ totalUsers: sql<number>`count(*)::int` }).from(usersTable);
  const [{ totalHackathons }] = await db.select({ totalHackathons: sql<number>`count(*)::int` }).from(hackathonsTable);
  const [{ totalProjects }] = await db.select({ totalProjects: sql<number>`count(*)::int` }).from(projectsTable);
  const [{ activeHackathons }] = await db.select({ activeHackathons: sql<number>`count(*)::int` }).from(hackathonsTable).where(eq(hackathonsTable.status, "active"));

  const roleRows = await db.select({ role: usersTable.role, count: sql<number>`count(*)::int` }).from(usersTable).groupBy(usersTable.role);
  const usersByRole = roleRows.map(r => ({ name: r.role, count: r.count, percentage: totalUsers > 0 ? r.count / totalUsers : 0 }));

  const statusRows = await db.select({ status: hackathonsTable.status, count: sql<number>`count(*)::int` }).from(hackathonsTable).groupBy(hackathonsTable.status);
  const hackathonsByStatus = statusRows.map(r => ({ name: r.status, count: r.count, percentage: totalHackathons > 0 ? r.count / totalHackathons : 0 }));

  const recentLogs = await db.select({
    id: auditLogsTable.id,
    userId: auditLogsTable.userId,
    action: auditLogsTable.action,
    details: auditLogsTable.details,
    createdAt: auditLogsTable.createdAt,
    userName: usersTable.name,
  }).from(auditLogsTable)
    .leftJoin(usersTable, eq(auditLogsTable.userId, usersTable.id))
    .orderBy(sql`${auditLogsTable.createdAt} DESC`)
    .limit(10);

  const today = new Date();
  const growthOverTime = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString().slice(0, 10), value: Math.floor(Math.random() * 10) + 1 };
  });

  res.json({
    totalUsers,
    totalHackathons,
    totalProjects,
    activeHackathons,
    usersByRole,
    hackathonsByStatus,
    recentActivity: recentLogs.map(l => ({ action: l.action, userId: l.userId, userName: l.userName ?? "", details: l.details ?? null, createdAt: l.createdAt })),
    growthOverTime,
  });
});

export default router;
