import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db, nowIso } from "../../db/index.js";
import { getPrimaryReality } from "../context.js";

export const evidenceRouter = Router();

interface BridgeEventRow {
  id: string;
  acontecimento: string;
  interpretacao: string | null;
  acao: string | null;
  evidencia: string | null;
  is_evidence: number;
  origin: string;
  created_at: string;
}

/** Banco de Evidências: só os eventos marcados como evidência de progresso. */
evidenceRouter.get("/", (req, res) => {
  const rows = db
    .prepare<[string], BridgeEventRow>(
      "SELECT * FROM bridge_events WHERE user_id = ? AND is_evidence = 1 ORDER BY created_at DESC"
    )
    .all(req.userId!);
  res.json({ evidence: rows });
});

/** Bridge of Events: a linha do tempo causal completa (desejo -> ação -> resultado). */
evidenceRouter.get("/bridge", (req, res) => {
  const rows = db
    .prepare<[string], BridgeEventRow>(
      "SELECT * FROM bridge_events WHERE user_id = ? ORDER BY created_at ASC"
    )
    .all(req.userId!);
  res.json({ events: rows });
});

evidenceRouter.post("/", (req, res) => {
  const userId = req.userId!;
  const { acontecimento, interpretacao, acao, evidencia, isEvidence } = req.body as {
    acontecimento?: string;
    interpretacao?: string;
    acao?: string;
    evidencia?: string;
    isEvidence?: boolean;
  };
  if (!acontecimento) {
    res.status(400).json({ error: "acontecimento é obrigatório." });
    return;
  }
  const reality = getPrimaryReality(userId);
  const id = uuid();
  db.prepare(
    `INSERT INTO bridge_events (id, user_id, reality_id, acontecimento, interpretacao, acao, evidencia, is_evidence, origin, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?)`
  ).run(
    id,
    userId,
    reality?.id ?? null,
    acontecimento,
    interpretacao ?? null,
    acao ?? null,
    evidencia ?? null,
    isEvidence ? 1 : 0,
    nowIso()
  );
  res.status(201).json({ id });
});
