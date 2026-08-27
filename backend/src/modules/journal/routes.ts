import { Router } from "express";
import { v4 as uuid } from "uuid";
import { getAIProvider } from "../../ai/index.js";
import { db, nowIso } from "../../db/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const journalRouter = Router();

const VALID_CATEGORIES = [
  "desejo",
  "emocao",
  "crenca",
  "acontecimento",
  "evidencia",
  "acao",
  "revisao",
] as const;

interface EntryRow {
  id: string;
  category: string;
  content: string;
  created_at: string;
}

journalRouter.get("/", (req, res) => {
  const rows = db
    .prepare<[string], EntryRow>(
      "SELECT id, category, content, created_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(req.userId!);
  res.json({ entries: rows });
});

journalRouter.post(
  "/",
  asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { content, category } = req.body as { content?: string; category?: string };
  if (!content) {
    res.status(400).json({ error: "content é obrigatório." });
    return;
  }
  const finalCategory = VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])
    ? (category as string)
    : "acontecimento";

  const id = uuid();
  const createdAt = nowIso();
  db.prepare(
    "INSERT INTO journal_entries (id, user_id, category, content, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(id, userId, finalCategory, content, createdAt);

  const count = (
    db.prepare("SELECT COUNT(*) as c FROM journal_entries WHERE user_id = ?").get(userId) as {
      c: number;
    }
  ).c;

  let newPatterns: string[] = [];
  if (count % 3 === 0) {
    const recent = db
      .prepare<[string, number], { content: string }>(
        "SELECT content FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
      )
      .all(userId, 5)
      .map((r) => r.content)
      .reverse();
    newPatterns = await getAIProvider().detectPatterns(recent);
    const insert = db.prepare(
      "INSERT INTO identity_patterns (id, user_id, pattern_text, created_at) VALUES (?, ?, ?, ?)"
    );
    for (const pattern of newPatterns) {
      insert.run(uuid(), userId, pattern, nowIso());
    }
  }

    res.status(201).json({ id, category: finalCategory, createdAt, newPatterns });
  })
);
