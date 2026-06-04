import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, auditLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, signToken } from "../middlewares/auth";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const { email, password, name, role, skills, bio, timezone, githubUrl, linkedinUrl } = req.body;
  if (!email || !password || !name || !role) {
    res.status(400).json({ error: "email, password, name, and role are required" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash,
    name,
    role: role ?? "participant",
    skills: skills ?? [],
    bio: bio ?? null,
    timezone: timezone ?? null,
    githubUrl: githubUrl ?? null,
    linkedinUrl: linkedinUrl ?? null,
    isActive: true,
  }).returning();
  await db.insert(auditLogsTable).values({
    userId: user.id,
    action: "USER_REGISTER",
    details: `User registered with role ${user.role}`,
    ipAddress: req.ip ?? null,
  });
  const accessToken = signToken({ userId: user.id, role: user.role, email: user.email });
  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json({ user: { ...safeUser, skills: safeUser.skills ?? [] }, accessToken });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (!user.isActive) {
    res.status(401).json({ error: "Account is deactivated" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  await db.insert(auditLogsTable).values({
    userId: user.id,
    action: "USER_LOGIN",
    details: null,
    ipAddress: req.ip ?? null,
  });
  const accessToken = signToken({ userId: user.id, role: user.role, email: user.email });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: { ...safeUser, skills: safeUser.skills ?? [] }, accessToken });
});

router.post("/auth/logout", authenticate, async (req, res) => {
  await db.insert(auditLogsTable).values({
    userId: req.user!.userId,
    action: "USER_LOGOUT",
    details: null,
    ipAddress: req.ip ?? null,
  });
  res.json({ success: true, message: "Logged out" });
});

router.get("/auth/me", authenticate, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json({ ...safeUser, skills: safeUser.skills ?? [] });
});

export default router;
