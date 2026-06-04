import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { anthropic, isAIAvailable } from "@workspace/integrations-anthropic-ai";
import { z } from "zod";

const router = Router();

const SYSTEM_PROMPT = `You are HackFlow AI — an intelligent assistant embedded in HackFlow, a premium enterprise hackathon management platform.

You help:
- Participants: find the right hackathon, form teams, get coding help, suggest project ideas, answer technical questions
- Organizers: set up events, define judging criteria, manage participants, plan timelines
- Mentors: guide teams, answer support questions
- Jury members: understand scoring matrices, evaluate projects fairly

You have deep knowledge of:
- Hackathon best practices and strategies
- Team formation and collaboration
- Software development (frontend, backend, AI/ML, mobile, web3)
- Project management and agile methodologies
- Pitch presentation and demo techniques

Be concise, helpful, and enthusiastic. Use markdown formatting for code and lists.
When suggesting code, always explain what it does. Always encourage and motivate participants.`;

const createConversationSchema = z.object({ title: z.string().min(1) });
const sendMessageSchema = z.object({ content: z.string().min(1) });

router.use(authenticate);

router.get("/anthropic/conversations", async (req, res) => {
  const userId = (req as any).user.id;
  const convs = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.createdAt));
  res.json(convs);
  return;
});

router.post("/anthropic/conversations", async (req, res) => {
  const parsed = createConversationSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const userId = (req as any).user.id;
  const [conv] = await db
    .insert(conversations)
    .values({ title: parsed.data.title, userId })
    .returning();
  res.status(201).json(conv);
  return;
});

router.get("/anthropic/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const userId = (req as any).user.id;
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv || conv.userId !== userId) { res.status(404).json({ error: "Not found" }); return; }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);
  res.json({ ...conv, messages: msgs });
  return;
});

router.delete("/anthropic/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const userId = (req as any).user.id;
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv || conv.userId !== userId) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(messages).where(eq(messages.conversationId, id));
  await db.delete(conversations).where(eq(conversations.id, id));
  res.status(204).end();
  return;
});

router.get("/anthropic/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const userId = (req as any).user.id;
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv || conv.userId !== userId) { res.status(404).json({ error: "Not found" }); return; }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);
  res.json(msgs);
  return;
});

router.post("/anthropic/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const userId = (req as any).user.id;
  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv || conv.userId !== userId) { res.status(404).json({ error: "Not found" }); return; }

  const [userMsg] = await db
    .insert(messages)
    .values({ conversationId: id, role: "user", content: parsed.data.content })
    .returning();

  if (!isAIAvailable) {
    const [assistantMsg] = await db
      .insert(messages)
      .values({
        conversationId: id,
        role: "assistant",
        content:
          "AI is not yet configured. Please configure the AI integration to enable AI features. In the meantime, I can help you with any hackathon questions once AI is activated!",
      })
      .returning();
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.write(`data: ${JSON.stringify({ content: assistantMsg.content })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  }

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  const chatMessages = history
    .filter((m) => m.id !== userMsg.id)
    .concat(userMsg)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: chatMessages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        fullResponse += event.delta.text;
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
      }
    }

    await db
      .insert(messages)
      .values({ conversationId: id, role: "assistant", content: fullResponse });
  } catch (err) {
    const fallback = "Sorry, I encountered an error. Please try again.";
    await db
      .insert(messages)
      .values({ conversationId: id, role: "assistant", content: fallback });
    res.write(`data: ${JSON.stringify({ content: fallback })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
  return;
});

export default router;
