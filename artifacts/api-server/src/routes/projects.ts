import { Router } from "express";
import { db, projectsTable, evaluationsTable, evaluationScoresTable, evaluationCriteriaTable, teamsTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/hackathons/:hackathonId/projects", async (req, res) => {
  const hackathonId = parseInt(req.params.hackathonId as string, 10);
  const projects = await db.select({
    id: projectsTable.id,
    hackathonId: projectsTable.hackathonId,
    teamId: projectsTable.teamId,
    title: projectsTable.title,
    description: projectsTable.description,
    readmeMarkdown: projectsTable.readmeMarkdown,
    repoUrl: projectsTable.repoUrl,
    demoUrl: projectsTable.demoUrl,
    videoUrl: projectsTable.videoUrl,
    techStack: projectsTable.techStack,
    status: projectsTable.status,
    totalScore: projectsTable.totalScore,
    rank: projectsTable.rank,
    createdAt: projectsTable.createdAt,
    submittedAt: projectsTable.submittedAt,
    teamName: teamsTable.name,
  }).from(projectsTable)
    .leftJoin(teamsTable, eq(projectsTable.teamId, teamsTable.id))
    .where(eq(projectsTable.hackathonId, hackathonId));
  res.json(projects.map(p => ({ ...p, techStack: p.techStack ?? [], teamName: p.teamName ?? "" })));
});

router.post("/projects", authenticate, async (req, res) => {
  const { hackathonId, teamId, title, description, readmeMarkdown, repoUrl, demoUrl, videoUrl, techStack } = req.body;
  const [project] = await db.insert(projectsTable).values({
    hackathonId,
    teamId,
    title,
    description: description ?? null,
    readmeMarkdown: readmeMarkdown ?? null,
    repoUrl: repoUrl ?? null,
    demoUrl: demoUrl ?? null,
    videoUrl: videoUrl ?? null,
    techStack: techStack ?? [],
    status: "draft",
  }).returning();
  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, teamId)).limit(1);
  res.status(201).json({ ...project, techStack: project.techStack ?? [], teamName: team?.name ?? "" });
});

router.get("/projects/:id", async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const [project] = await db.select({
    id: projectsTable.id,
    hackathonId: projectsTable.hackathonId,
    teamId: projectsTable.teamId,
    title: projectsTable.title,
    description: projectsTable.description,
    readmeMarkdown: projectsTable.readmeMarkdown,
    repoUrl: projectsTable.repoUrl,
    demoUrl: projectsTable.demoUrl,
    videoUrl: projectsTable.videoUrl,
    techStack: projectsTable.techStack,
    status: projectsTable.status,
    totalScore: projectsTable.totalScore,
    rank: projectsTable.rank,
    createdAt: projectsTable.createdAt,
    submittedAt: projectsTable.submittedAt,
    teamName: teamsTable.name,
  }).from(projectsTable)
    .leftJoin(teamsTable, eq(projectsTable.teamId, teamsTable.id))
    .where(eq(projectsTable.id, id)).limit(1);
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  res.json({ ...project, techStack: project.techStack ?? [], teamName: project.teamName ?? "" });
});

router.patch("/projects/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const { title, description, readmeMarkdown, repoUrl, demoUrl, videoUrl, techStack, status } = req.body;
  const updates: Partial<typeof projectsTable.$inferInsert> = {};
  if (title) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (readmeMarkdown !== undefined) updates.readmeMarkdown = readmeMarkdown;
  if (repoUrl !== undefined) updates.repoUrl = repoUrl;
  if (demoUrl !== undefined) updates.demoUrl = demoUrl;
  if (videoUrl !== undefined) updates.videoUrl = videoUrl;
  if (techStack) updates.techStack = techStack;
  if (status) {
    updates.status = status;
    if (status === "submitted") updates.submittedAt = new Date();
  }
  const [project] = await db.update(projectsTable).set(updates).where(eq(projectsTable.id, id)).returning();
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, project.teamId)).limit(1);
  res.json({ ...project, techStack: project.techStack ?? [], teamName: team?.name ?? "" });
});

router.post("/projects/:id/evaluate", authenticate, requireRole("jury", "admin"), async (req, res) => {
  const projectId = parseInt(req.params.id as string, 10);
  const juryId = req.user!.userId;
  const { scores, feedback } = req.body;

  const criteria = await db.select().from(evaluationCriteriaTable).where(
    eq(evaluationCriteriaTable.id, scores[0]?.criterionId ?? 0)
  );

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1);
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }

  const allCriteria = await db.select().from(evaluationCriteriaTable).where(eq(evaluationCriteriaTable.hackathonId, project.hackathonId));
  let totalScore = 0;
  for (const s of scores) {
    const criterion = allCriteria.find(c => c.id === s.criterionId);
    if (criterion) totalScore += (s.score / criterion.maxScore) * criterion.weight * 100;
  }

  const [evaluation] = await db.insert(evaluationsTable).values({ projectId, juryId, totalScore, feedback }).returning();
  await Promise.all(scores.map((s: { criterionId: number; score: number }) =>
    db.insert(evaluationScoresTable).values({ evaluationId: evaluation.id, criterionId: s.criterionId, score: s.score })
  ));

  const [jury] = await db.select().from(usersTable).where(eq(usersTable.id, juryId)).limit(1);
  res.json({ ...evaluation, juryName: jury?.name ?? "", scores });
});

router.get("/projects/:id/evaluations", async (req, res) => {
  const projectId = parseInt(req.params.id as string, 10);
  const evals = await db.select({
    id: evaluationsTable.id,
    projectId: evaluationsTable.projectId,
    juryId: evaluationsTable.juryId,
    totalScore: evaluationsTable.totalScore,
    feedback: evaluationsTable.feedback,
    createdAt: evaluationsTable.createdAt,
    juryName: usersTable.name,
  }).from(evaluationsTable)
    .leftJoin(usersTable, eq(evaluationsTable.juryId, usersTable.id))
    .where(eq(evaluationsTable.projectId, projectId));

  const enriched = await Promise.all(evals.map(async (e) => {
    const scores = await db.select().from(evaluationScoresTable).where(eq(evaluationScoresTable.evaluationId, e.id));
    return { ...e, juryName: e.juryName ?? "", scores };
  }));
  res.json(enriched);
});

router.get("/hackathons/:hackathonId/leaderboard", async (req, res) => {
  const hackathonId = parseInt(req.params.hackathonId as string, 10);
  const projects = await db.select({
    id: projectsTable.id,
    hackathonId: projectsTable.hackathonId,
    teamId: projectsTable.teamId,
    title: projectsTable.title,
    description: projectsTable.description,
    techStack: projectsTable.techStack,
    status: projectsTable.status,
    totalScore: projectsTable.totalScore,
    rank: projectsTable.rank,
    createdAt: projectsTable.createdAt,
    submittedAt: projectsTable.submittedAt,
    teamName: teamsTable.name,
  }).from(projectsTable)
    .leftJoin(teamsTable, eq(projectsTable.teamId, teamsTable.id))
    .where(and(eq(projectsTable.hackathonId, hackathonId), sql`${projectsTable.totalScore} IS NOT NULL`));

const criteria = await db.select().from(evaluationCriteriaTable).where(eq(evaluationCriteriaTable.hackathonId, hackathonId));

   const projectIds = projects.map(p => p.id);
  const allEvaluations = projectIds.length > 0
    ? await db.select().from(evaluationsTable).where(sql`${evaluationsTable.projectId} = ANY(${sql.raw(`ARRAY[${projectIds.join(",")}]`)})`)
    : [];
  const allScores = allEvaluations.length > 0
    ? await db.select().from(evaluationScoresTable).where(sql`${evaluationScoresTable.evaluationId} = ANY(${sql.raw(`ARRAY[${allEvaluations.map(e => e.id).join(",")}]`)})`)
    : [];

  const sorted = projects
    .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))
    .map((p, idx) => {
      const projEvals = allEvaluations.filter(e => e.projectId === p.id);
      const projScores = allScores.filter(s => projEvals.some(e => e.id === s.evaluationId));
      const scoreBreakdown = criteria.map(c => {
        const cScores = projScores.filter(s => s.criterionId === c.id);
        const avgScore = cScores.length > 0
          ? cScores.reduce((sum, s) => sum + s.score, 0) / cScores.length
          : 0;
        return {
          criterionName: c.name,
          score: parseFloat(avgScore.toFixed(2)),
          weight: c.weight,
          weightedScore: parseFloat((avgScore * c.weight / 10).toFixed(2)),
        };
      });
      return {
        rank: idx + 1,
        project: { ...p, techStack: p.techStack ?? [], teamName: p.teamName ?? "", repoUrl: null, demoUrl: null, videoUrl: null, readmeMarkdown: null },
        totalScore: p.totalScore ?? 0,
        scoreBreakdown,
      };
    });

  res.json(sorted);
});

export default router;
