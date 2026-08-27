import { db } from "../db/index.js";
import type { DNA, NarrativeContext, WorldState } from "../ai/types.js";

interface RealityRow {
  id: string;
  area: string;
  world_state_json: string;
}

export function getPrimaryReality(userId: string): RealityRow | undefined {
  return db
    .prepare<[string], RealityRow>(
      "SELECT id, area, world_state_json FROM realities WHERE user_id = ? AND is_primary = 1 ORDER BY created_at DESC LIMIT 1"
    )
    .get(userId);
}

export function getDNA(userId: string): DNA | undefined {
  const row = db
    .prepare<[string], { dna_atual: string; dna_assumido: string }>(
      "SELECT dna_atual, dna_assumido FROM identity_dna WHERE user_id = ?"
    )
    .get(userId);
  return row ? { atual: row.dna_atual, assumido: row.dna_assumido } : undefined;
}

export function getPatterns(userId: string, limit = 5): string[] {
  return db
    .prepare<[string, number], { pattern_text: string }>(
      "SELECT pattern_text FROM identity_patterns WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
    )
    .all(userId, limit)
    .map((r) => r.pattern_text);
}

export function getRecentNarrative(realityId: string, limit = 3): string[] {
  return db
    .prepare<[string, number], { narrative: string }>(
      "SELECT narrative FROM scenes WHERE reality_id = ? ORDER BY created_at DESC LIMIT ?"
    )
    .all(realityId, limit)
    .map((r) => r.narrative)
    .reverse();
}

/** Monta o NarrativeContext a partir do estado atual do usuário. Lança se faltar pré-requisito. */
export function buildContext(userId: string): NarrativeContext {
  const reality = getPrimaryReality(userId);
  if (!reality) {
    throw new Error("Usuário ainda não tem uma realidade principal definida.");
  }
  const dna = getDNA(userId);
  if (!dna) {
    throw new Error("Usuário ainda não completou o onboarding (DNA ausente).");
  }
  const worldState = JSON.parse(reality.world_state_json) as WorldState;
  return {
    area: reality.area,
    dna,
    worldState,
    recentNarrative: getRecentNarrative(reality.id),
    patterns: getPatterns(userId),
  };
}
