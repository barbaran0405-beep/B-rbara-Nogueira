import { Router } from "express";
import { v4 as uuid } from "uuid";
import { getAIProvider } from "../../ai/index.js";
import { db, nowIso } from "../../db/index.js";
import { buildContext, getPrimaryReality } from "../context.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const challengesRouter = Router();

interface ChallengeRow {
  id: string;
  reality_id: string | null;
  description: string;
  status: string;
  closure_reflection: string | null;
  created_at: string;
  closed_at: string | null;
}

challengesRouter.get("/", (req, res) => {
  const rows = db
    .prepare<[string], ChallengeRow>(
      "SELECT id, reality_id, description, status, closure_reflection, created_at, closed_at FROM challenges WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(req.userId!);
  res.json({ challenges: rows });
});

challengesRouter.post(
  "/generate",
  asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const reality = getPrimaryReality(userId);
  const ctx = buildContext(userId);
  const description = await getAIProvider().generateChallenge(ctx);
  const id = uuid();
  const createdAt = nowIso();
  db.prepare(
    "INSERT INTO challenges (id, user_id, reality_id, description, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)"
  ).run(id, userId, reality?.id ?? null, description, createdAt);
    res.status(201).json({ id, description, status: "pending", createdAt });
  })
);

challengesRouter.post("/:id/close", (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  const { done, reflection } = req.body as { done?: boolean; reflection?: string };

  const challenge = db
    .prepare<[string, string], ChallengeRow>("SELECT * FROM challenges WHERE id = ? AND user_id = ?")
    .get(id, userId);
  if (!challenge) {
    res.status(404).json({ error: "Desafio não encontrado." });
    return;
  }

  const closedAt = nowIso();
  const status = done ? "done" : "skipped";
  db.prepare(
    "UPDATE challenges SET status = ?, closure_reflection = ?, closed_at = ? WHERE id = ?"
  ).run(status, reflection ?? null, closedAt, id);

  if (done) {
    db.prepare(
      `INSERT INTO bridge_events (id, user_id, reality_id, acontecimento, interpretacao, acao, evidencia, is_evidence, origin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'challenge', ?)`
    ).run(
      uuid(),
      userId,
      challenge.reality_id,
      challenge.description,
      reflection ?? null,
      challenge.description,
      reflection ?? "Desafio concluído.",
      closedAt
    );
  }

  res.json({ id, status, closedAt });
});
