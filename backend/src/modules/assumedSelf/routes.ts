import { Router } from "express";
import { v4 as uuid } from "uuid";
import { getAIProvider } from "../../ai/index.js";
import { db, nowIso } from "../../db/index.js";
import { buildContext } from "../context.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const assumedSelfRouter = Router();

interface MessageRow {
  role: string;
  content: string;
  created_at: string;
}

assumedSelfRouter.get("/messages", (req, res) => {
  const rows = db
    .prepare<[string], MessageRow>(
      "SELECT role, content, created_at FROM assumed_self_messages WHERE user_id = ? ORDER BY created_at ASC"
    )
    .all(req.userId!);
  res.json({ messages: rows });
});

assumedSelfRouter.post(
  "/messages",
  asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { content } = req.body as { content?: string };
  if (!content) {
    res.status(400).json({ error: "content é obrigatório." });
    return;
  }

  const history = db
    .prepare<[string], MessageRow>(
      "SELECT role, content, created_at FROM assumed_self_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 20"
    )
    .all(userId);

  const ctx = buildContext(userId);
  const reply = await getAIProvider().assumedSelfReply(ctx, history, content);

  const now = nowIso();
  db.prepare(
    "INSERT INTO assumed_self_messages (id, user_id, role, content, created_at) VALUES (?, ?, 'user', ?, ?)"
  ).run(uuid(), userId, content, now);
  db.prepare(
    "INSERT INTO assumed_self_messages (id, user_id, role, content, created_at) VALUES (?, ?, 'assumed_self', ?, ?)"
  ).run(uuid(), userId, reply, nowIso());

    res.status(201).json({ reply });
  })
);
