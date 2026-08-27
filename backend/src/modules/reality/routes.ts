import { Router } from "express";
import { v4 as uuid } from "uuid";
import { getAIProvider } from "../../ai/index.js";
import { db, nowIso } from "../../db/index.js";
import { buildContext, getDNA, getPrimaryReality } from "../context.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import type { WorldState } from "../../ai/types.js";

export const realityRouter = Router();

const RECAP_THRESHOLD_HOURS = 4;

interface SceneRow {
  id: string;
  reality_id: string;
  narrative: string;
  options_json: string;
  chosen_option_id: string | null;
  is_pending_recap: number;
  created_at: string;
}

function serializeScene(row: SceneRow) {
  return {
    id: row.id,
    narrative: row.narrative,
    options: JSON.parse(row.options_json) as { id: string; label: string }[],
    answered: row.chosen_option_id !== null,
    isPendingRecap: Boolean(row.is_pending_recap),
    createdAt: row.created_at,
  };
}

realityRouter.post(
  "/",
  asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { area, tercaFeiraIdeal } = req.body as { area?: string; tercaFeiraIdeal?: string };
  if (!area || !tercaFeiraIdeal) {
    res.status(400).json({ error: "area e tercaFeiraIdeal são obrigatórios." });
    return;
  }

  const existing = getPrimaryReality(userId);
  if (existing) {
    res.status(409).json({
      error:
        "Você já tem uma realidade principal. O JÁ É trabalha com uma realidade por vez até haver consistência de prática.",
      realityId: existing.id,
    });
    return;
  }

  const dna = getDNA(userId);
  if (!dna) {
    res.status(400).json({ error: "Complete o onboarding antes de criar sua realidade." });
    return;
  }

  const worldState: WorldState = await getAIProvider().generateWorldState(area, tercaFeiraIdeal, dna);
  const id = uuid();
  const createdAt = nowIso();
  db.prepare(
    "INSERT INTO realities (id, user_id, area, name, is_primary, world_state_json, created_at) VALUES (?, ?, ?, ?, 1, ?, ?)"
  ).run(id, userId, area, area, JSON.stringify(worldState), createdAt);

    res.status(201).json({ id, area, worldState, createdAt });
  })
);

realityRouter.get("/primary", (req, res) => {
  const reality = getPrimaryReality(req.userId!);
  if (!reality) {
    res.status(404).json({ error: "Nenhuma realidade principal ainda." });
    return;
  }
  res.json({ id: reality.id, area: reality.area, worldState: JSON.parse(reality.world_state_json) });
});

/** ENTRAR NA MINHA REALIDADE: retoma cena pendente, gera recap, ou avança a narrativa. */
realityRouter.post(
  "/enter",
  asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const reality = getPrimaryReality(userId);
  if (!reality) {
    res.status(400).json({ error: "Crie sua realidade principal antes de entrar nela." });
    return;
  }

  const lastScene = db
    .prepare<[string], SceneRow>(
      "SELECT * FROM scenes WHERE reality_id = ? ORDER BY created_at DESC LIMIT 1"
    )
    .get(reality.id);

  if (lastScene && lastScene.chosen_option_id === null) {
    res.json({ scene: serializeScene(lastScene) });
    return;
  }

  const ctx = buildContext(userId);
  const ai = getAIProvider();

  if (lastScene) {
    const hoursAway = (Date.now() - new Date(lastScene.created_at).getTime()) / 3_600_000;
    if (hoursAway >= RECAP_THRESHOLD_HOURS) {
      const recapNarrative = await ai.generatePendingRecap(ctx, Math.round(hoursAway));
      const id = uuid();
      const createdAt = nowIso();
      const options = [{ id: "continue", label: "Continuar" }];
      db.prepare(
        "INSERT INTO scenes (id, reality_id, narrative, options_json, chosen_option_id, is_pending_recap, created_at) VALUES (?, ?, ?, ?, NULL, 1, ?)"
      ).run(id, reality.id, recapNarrative, JSON.stringify(options), createdAt);
      res.json({
        scene: serializeScene({
          id,
          reality_id: reality.id,
          narrative: recapNarrative,
          options_json: JSON.stringify(options),
          chosen_option_id: null,
          is_pending_recap: 1,
          created_at: createdAt,
        }),
      });
      return;
    }
  }

  const scene = await ai.generateScene(ctx);
  const id = uuid();
  const createdAt = nowIso();
  db.prepare(
    "INSERT INTO scenes (id, reality_id, narrative, options_json, chosen_option_id, is_pending_recap, created_at) VALUES (?, ?, ?, ?, NULL, 0, ?)"
  ).run(id, reality.id, scene.narrative, JSON.stringify(scene.options), createdAt);

  res.json({
    scene: serializeScene({
      id,
      reality_id: reality.id,
      narrative: scene.narrative,
      options_json: JSON.stringify(scene.options),
      chosen_option_id: null,
      is_pending_recap: 0,
      created_at: createdAt,
    }),
  });
  })
);

/** Registra a escolha do usuário numa cena e gera a próxima. */
realityRouter.post(
  "/scenes/:sceneId/choice",
  asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { sceneId } = req.params;
  const { optionId } = req.body as { optionId?: string };
  if (!optionId) {
    res.status(400).json({ error: "optionId é obrigatório." });
    return;
  }

  const reality = getPrimaryReality(userId);
  if (!reality) {
    res.status(400).json({ error: "Nenhuma realidade principal." });
    return;
  }

  const scene = db
    .prepare<[string, string], SceneRow>("SELECT * FROM scenes WHERE id = ? AND reality_id = ?")
    .get(sceneId, reality.id);
  if (!scene) {
    res.status(404).json({ error: "Cena não encontrada." });
    return;
  }
  const options = JSON.parse(scene.options_json) as { id: string; label: string }[];
  const chosen = options.find((o) => o.id === optionId);
  if (!chosen) {
    res.status(400).json({ error: "optionId inválido para esta cena." });
    return;
  }

  db.prepare("UPDATE scenes SET chosen_option_id = ? WHERE id = ?").run(optionId, sceneId);

  if (!scene.is_pending_recap) {
    db.prepare(
      `INSERT INTO bridge_events (id, user_id, reality_id, acontecimento, interpretacao, acao, evidencia, is_evidence, origin, created_at)
       VALUES (?, ?, ?, ?, NULL, ?, NULL, 0, 'reality_engine', ?)`
    ).run(uuid(), userId, reality.id, scene.narrative, chosen.label, nowIso());
  }

  const ctx = buildContext(userId);
  const next = await getAIProvider().generateScene(ctx, chosen.label);
  const id = uuid();
  const createdAt = nowIso();
  db.prepare(
    "INSERT INTO scenes (id, reality_id, narrative, options_json, chosen_option_id, is_pending_recap, created_at) VALUES (?, ?, ?, ?, NULL, 0, ?)"
  ).run(id, reality.id, next.narrative, JSON.stringify(next.options), createdAt);

  res.json({
    scene: serializeScene({
      id,
      reality_id: reality.id,
      narrative: next.narrative,
      options_json: JSON.stringify(next.options),
      chosen_option_id: null,
      is_pending_recap: 0,
      created_at: createdAt,
    }),
  });
  })
);
