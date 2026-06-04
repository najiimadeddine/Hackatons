import { Router } from "express";
import { db, chatRoomsTable, chatMessagesTable, usersTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.get("/chat/rooms", authenticate, async (req, res) => {
  const rooms = await db.select().from(chatRoomsTable);
  const enriched = await Promise.all(rooms.map(async (room) => {
    const [lastMsg] = await db.select().from(chatMessagesTable).where(eq(chatMessagesTable.roomId, room.id)).orderBy(desc(chatMessagesTable.createdAt)).limit(1);
    return {
      ...room,
      lastMessage: lastMsg?.content ?? null,
      lastMessageAt: lastMsg?.createdAt ?? null,
      unreadCount: 0,
    };
  }));
  res.json(enriched);
});

router.get("/chat/rooms/:roomId/messages", authenticate, async (req, res) => {
  const roomId = parseInt(req.params.roomId as string, 10);
  const messages = await db.select({
    id: chatMessagesTable.id,
    roomId: chatMessagesTable.roomId,
    senderId: chatMessagesTable.senderId,
    content: chatMessagesTable.content,
    createdAt: chatMessagesTable.createdAt,
    senderName: usersTable.name,
    senderAvatar: usersTable.avatarUrl,
  }).from(chatMessagesTable)
    .leftJoin(usersTable, eq(chatMessagesTable.senderId, usersTable.id))
    .where(eq(chatMessagesTable.roomId, roomId))
    .orderBy(desc(chatMessagesTable.createdAt))
    .limit(50);
  res.json(messages.map(m => ({ ...m, senderName: m.senderName ?? "", senderAvatar: m.senderAvatar ?? null })).reverse());
});

router.post("/chat/rooms/:roomId/messages", authenticate, async (req, res) => {
  const roomId = parseInt(req.params.roomId as string, 10);
  const { content } = req.body;
  const [message] = await db.insert(chatMessagesTable).values({
    roomId,
    senderId: req.user!.userId,
    content,
  }).returning();
  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  res.status(201).json({
    ...message,
    senderName: sender?.name ?? "",
    senderAvatar: sender?.avatarUrl ?? null,
  });
});

export default router;
