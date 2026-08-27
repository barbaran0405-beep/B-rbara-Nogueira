import { Router } from "express";
import { getAIProvider } from "../../ai/index.js";
import { db, nowIso } from "../../db/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import type { OnboardingAnswers } from "../../ai/types.js";

export const onboardingRouter = Router();

const REQUIRED_FIELDS: (keyof OnboardingAnswers)[] = [
  "rotina",
  "trabalho",
  "financas",
  "relacionamentos",
  "autoimagem",
  "desejaMudar",
  "medos",
  "crencasDinheiro",
  "crencasAmor",
  "crencasSucesso",
  "reacaoAoErro",
  "padroesRepetidos",
  "tercaFeiraIdeal",
];

onboardingRouter.post(
  "/",
  asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const answers = req.body as Partial<OnboardingAnswers>;
  const missing = REQUIRED_FIELDS.filter((f) => !answers[f]);
  if (missing.length > 0) {
    res.status(400).json({ error: `Campos ausentes: ${missing.join(", ")}` });
    return;
  }

  const complete = answers as OnboardingAnswers;
  const now = nowIso();

  db.prepare(
    `INSERT INTO profiles (user_id, onboarding_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET onboarding_json = excluded.onboarding_json, updated_at = excluded.updated_at`
  ).run(userId, JSON.stringify(complete), now);

  const dna = await getAIProvider().generateDNA(complete);

  db.prepare(
    `INSERT INTO identity_dna (user_id, dna_atual, dna_assumido, version, updated_at) VALUES (?, ?, ?, 1, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       dna_atual = excluded.dna_atual,
       dna_assumido = excluded.dna_assumido,
       version = identity_dna.version + 1,
       updated_at = excluded.updated_at`
  ).run(userId, dna.atual, dna.assumido, now);

    res.status(201).json({ dna, tercaFeiraIdeal: complete.tercaFeiraIdeal });
  })
);

onboardingRouter.get("/status", (req, res) => {
  const userId = req.userId!;
  const profile = db
    .prepare("SELECT 1 FROM profiles WHERE user_id = ?")
    .get(userId);
  const dna = db
    .prepare("SELECT dna_atual, dna_assumido FROM identity_dna WHERE user_id = ?")
    .get(userId) as { dna_atual: string; dna_assumido: string } | undefined;
  const reality = db
    .prepare("SELECT id FROM realities WHERE user_id = ? AND is_primary = 1")
    .get(userId);

  res.json({
    onboardingComplete: Boolean(profile),
    dna: dna ? { atual: dna.dna_atual, assumido: dna.dna_assumido } : null,
    hasPrimaryReality: Boolean(reality),
  });
});
