import { Router } from "express";
import { db, auditLogsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/admin/audit-logs", authenticate, requireRole("admin"), async (req, res) => {
  const { userId, action, page = "1", limit = "50" } = req.query as Record<string, string>;
  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 200);
  const offset = (pageNum - 1) * limitNum;

  const logs = await db.select({
    id: auditLogsTable.id,
    userId: auditLogsTable.userId,
    action: auditLogsTable.action,
    details: auditLogsTable.details,
    ipAddress: auditLogsTable.ipAddress,
    createdAt: auditLogsTable.createdAt,
    userName: usersTable.name,
  }).from(auditLogsTable)
    .leftJoin(usersTable, eq(auditLogsTable.userId, usersTable.id))
    .orderBy(sql`${auditLogsTable.createdAt} DESC`)
    .limit(limitNum)
    .offset(offset);

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(auditLogsTable);
  res.json({
    data: logs.map(l => ({ ...l, userName: l.userName ?? "" })),
    total: count,
    page: pageNum,
    limit: limitNum,
  });
});

export default router;
