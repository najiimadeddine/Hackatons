import { Router } from "express";
import { db, hackathonsTable, projectsTable, teamsTable, teamMembersTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";

const router = Router();

async function buildPortfolio(hackathonId: number) {
  const [hackathon] = await db.select().from(hackathonsTable).where(eq(hackathonsTable.id, hackathonId)).limit(1);
  if (!hackathon) return null;

  const projects = await db.select({
    id: projectsTable.id,
    title: projectsTable.title,
    description: projectsTable.description,
    teamId: projectsTable.teamId,
    repoUrl: projectsTable.repoUrl,
    demoUrl: projectsTable.demoUrl,
    videoUrl: projectsTable.videoUrl,
    techStack: projectsTable.techStack,
    totalScore: projectsTable.totalScore,
    rank: projectsTable.rank,
    status: projectsTable.status,
    teamName: teamsTable.name,
  }).from(projectsTable)
    .leftJoin(teamsTable, eq(projectsTable.teamId, teamsTable.id))
    .where(eq(projectsTable.hackathonId, hackathonId))
    .orderBy(sql`${projectsTable.rank} ASC NULLS LAST`);

  const portfolioProjects = await Promise.all(projects.map(async (p, idx) => {
    const members = await db.select({
      userId: teamMembersTable.userId,
      role: teamMembersTable.role,
      joinedAt: teamMembersTable.joinedAt,
      name: usersTable.name,
      avatarUrl: usersTable.avatarUrl,
      skills: usersTable.skills,
    }).from(teamMembersTable)
      .leftJoin(usersTable, eq(teamMembersTable.userId, usersTable.id))
      .where(eq(teamMembersTable.teamId, p.teamId));

    const badges: string[] = [];
    const rank = p.rank ?? (idx + 1);
    if (rank === 1) badges.push("Winner");
    if (rank === 2) badges.push("Runner-Up");
    if (rank === 3) badges.push("Third Place");
    if (p.status === "finalist") badges.push("Finalist");

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      teamName: p.teamName ?? "",
      members: members.map(m => ({ ...m, skills: m.skills ?? [] })),
      repoUrl: p.repoUrl,
      demoUrl: p.demoUrl,
      videoUrl: p.videoUrl,
      techStack: p.techStack ?? [],
      rank,
      totalScore: p.totalScore ?? 0,
      badges,
    };
  }));

  const [{ totalParticipants }] = await db.select({ totalParticipants: sql<number>`count(*)::int` }).from(teamMembersTable)
    .leftJoin(teamsTable, eq(teamMembersTable.teamId, teamsTable.id))
    .where(eq(teamsTable.hackathonId, hackathonId));

  return {
    hackathonId,
    hackathonTitle: hackathon.title,
    generatedAt: new Date().toISOString(),
    projects: portfolioProjects,
    totalParticipants,
    totalTeams: projects.length,
  };
}

router.get("/portfolios/:hackathonId", async (req, res) => {
  const hackathonId = parseInt(req.params.hackathonId as string, 10);
  const portfolio = await buildPortfolio(hackathonId);
  if (!portfolio) { res.status(404).json({ error: "Hackathon not found" }); return; }
  res.json(portfolio);
});

router.post("/portfolios/:hackathonId/generate", authenticate, async (req, res) => {
  const hackathonId = parseInt(req.params.hackathonId as string, 10);
  const portfolio = await buildPortfolio(hackathonId);
  if (!portfolio) { res.status(404).json({ error: "Hackathon not found" }); return; }
  res.json(portfolio);
});

export default router;
