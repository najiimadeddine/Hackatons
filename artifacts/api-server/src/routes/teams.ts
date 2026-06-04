import { Router } from "express";
import { db, teamsTable, teamMembersTable, teamInvitationsTable, matchSwipesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.get("/hackathons/:hackathonId/teams", async (req, res) => {
  const hackathonId = parseInt(req.params.hackathonId as string, 10);
  const teams = await db.select().from(teamsTable).where(eq(teamsTable.hackathonId, hackathonId));
  const enriched = await Promise.all(teams.map(async (team) => {
    const members = await db.select({
      userId: teamMembersTable.userId,
      role: teamMembersTable.role,
      joinedAt: teamMembersTable.joinedAt,
      name: usersTable.name,
      avatarUrl: usersTable.avatarUrl,
      skills: usersTable.skills,
    }).from(teamMembersTable)
      .leftJoin(usersTable, eq(teamMembersTable.userId, usersTable.id))
      .where(eq(teamMembersTable.teamId, team.id));
    return { ...team, lookingForRoles: team.lookingForRoles ?? [], members: members.map(m => ({ ...m, skills: m.skills ?? [] })) };
  }));
  res.json(enriched);
});

router.post("/hackathons/:hackathonId/teams", authenticate, async (req, res) => {
  const hackathonId = parseInt(req.params.hackathonId as string, 10);
  const { name, description, lookingForRoles } = req.body as { name: string; description?: string; lookingForRoles?: string[] };
  const [team] = await db.insert(teamsTable).values({
    hackathonId,
    name,
    description: description ?? null,
    lookingForRoles: lookingForRoles ?? [],
    leaderId: req.user!.userId,
  }).returning();
  await db.insert(teamMembersTable).values({ teamId: team.id, userId: req.user!.userId, role: "leader" });
  res.status(201).json({ ...team, lookingForRoles: team.lookingForRoles ?? [], members: [] });
});

router.get("/teams/:id", async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, id)).limit(1);
  if (!team) { res.status(404).json({ error: "Team not found" }); return; }
  const members = await db.select({
    userId: teamMembersTable.userId,
    role: teamMembersTable.role,
    joinedAt: teamMembersTable.joinedAt,
    name: usersTable.name,
    avatarUrl: usersTable.avatarUrl,
    skills: usersTable.skills,
  }).from(teamMembersTable)
    .leftJoin(usersTable, eq(teamMembersTable.userId, usersTable.id))
    .where(eq(teamMembersTable.teamId, id));
  res.json({ ...team, lookingForRoles: team.lookingForRoles ?? [], members: members.map(m => ({ ...m, skills: m.skills ?? [] })) });
});

router.patch("/teams/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const { name, description, avatarUrl, lookingForRoles } = req.body as {
    name?: string; description?: string; avatarUrl?: string; lookingForRoles?: string[];
  };
  const updates: Partial<typeof teamsTable.$inferInsert> = {};
  if (name) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (lookingForRoles) updates.lookingForRoles = lookingForRoles;
  const [team] = await db.update(teamsTable).set(updates).where(eq(teamsTable.id, id)).returning();
  if (!team) { res.status(404).json({ error: "Team not found" }); return; }
  res.json({ ...team, lookingForRoles: team.lookingForRoles ?? [], members: [] });
});

router.post("/teams/:id/invite", authenticate, async (req, res) => {
  const teamId = parseInt(req.params.id as string, 10);
  const { userId, message } = req.body as { userId: number; message?: string };
  const [invitation] = await db.insert(teamInvitationsTable).values({
    teamId, userId,
    message: message ?? null,
    status: "pending",
  }).returning();
  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, teamId)).limit(1);
  res.json({ ...invitation, teamName: team?.name ?? "" });
});

router.post("/team-invitations/:id/respond", authenticate, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  const { accept } = req.body as { accept: boolean };
  const [invitation] = await db.update(teamInvitationsTable)
    .set({ status: accept ? "accepted" : "declined" })
    .where(eq(teamInvitationsTable.id, id))
    .returning();
  if (!invitation) { res.status(404).json({ error: "Invitation not found" }); return; }
  if (accept) {
    await db.insert(teamMembersTable).values({ teamId: invitation.teamId, userId: invitation.userId, role: "member" });
  }
  res.json({ success: true, message: accept ? "Invitation accepted" : "Invitation declined" });
});

router.post("/teams/:id/leave", authenticate, async (req, res) => {
  const teamId = parseInt(req.params.id as string, 10);
  await db.delete(teamMembersTable).where(and(eq(teamMembersTable.teamId, teamId), eq(teamMembersTable.userId, req.user!.userId)));
  res.json({ success: true, message: "Left team" });
});

router.get("/hackathons/:hackathonId/matchmaking/candidates", authenticate, async (req, res) => {
  const hackathonId = parseInt(req.params.hackathonId as string, 10);
  const userId = req.user!.userId;

  const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const swipedIds = await db.select({ toUserId: matchSwipesTable.toUserId })
    .from(matchSwipesTable)
    .where(and(eq(matchSwipesTable.hackathonId, hackathonId), eq(matchSwipesTable.fromUserId, userId)));
  const swipedSet = new Set(swipedIds.map(s => s.toUserId));
  swipedSet.add(userId);

  const allUsers = await db.select().from(usersTable).where(eq(usersTable.role, "participant"));
  const candidates = allUsers
    .filter(u => !swipedSet.has(u.id))
    .map(u => {
      const userSkills: string[] = currentUser?.skills ?? [];
      const candidateSkills: string[] = u.skills ?? [];
      const matchedSkills = userSkills.filter(s => candidateSkills.includes(s));
      const uniqueSkills = candidateSkills.filter(s => !userSkills.includes(s));
      const compatibilityScore = Math.min(0.3 + (matchedSkills.length * 0.15) + (uniqueSkills.length * 0.1), 1.0);
      const timezoneCompatibility = u.timezone === currentUser?.timezone ? 1.0 : 0.7;
      const { passwordHash: _, ...safeUser } = u;
      return {
        user: { ...safeUser, skills: safeUser.skills ?? [] },
        compatibilityScore: parseFloat(compatibilityScore.toFixed(2)),
        matchedSkills,
        complementaryRoles: uniqueSkills.slice(0, 3),
        timezoneCompatibility,
      };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, 20);

  res.json(candidates);
});

router.post("/hackathons/:hackathonId/matchmaking/swipe", authenticate, async (req, res) => {
  const hackathonId = parseInt(req.params.hackathonId as string, 10);
  const { targetUserId, direction } = req.body as { targetUserId: number; direction: "left" | "right" };
  try {
    await db.insert(matchSwipesTable).values({
      hackathonId,
      fromUserId: req.user!.userId,
      toUserId: targetUserId,
      direction,
    });
} catch {
   }
   res.json({ success: true, message: `Swiped ${direction}` });
});

export default router;
