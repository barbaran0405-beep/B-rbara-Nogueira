import { Router } from "express";
import { db } from "../../db/index.js";
import { getPatterns } from "../context.js";

export const identityRouter = Router();

identityRouter.get("/dna", (req, res) => {
  const userId = req.userId!;
  const row = db
    .prepare("SELECT dna_atual, dna_assumido, version FROM identity_dna WHERE user_id = ?")
    .get(userId) as { dna_atual: string; dna_assumido: string; version: number } | undefined;
  if (!row) {
    res.status(404).json({ error: "DNA ainda não gerado. Complete o onboarding primeiro." });
    return;
  }
  res.json({ atual: row.dna_atual, assumido: row.dna_assumido, version: row.version });
});

identityRouter.get("/patterns", (req, res) => {
  res.json({ patterns: getPatterns(req.userId!, 20) });
});
