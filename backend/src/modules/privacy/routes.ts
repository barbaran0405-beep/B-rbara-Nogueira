import { Router } from "express";
import { db, nowIso } from "../../db/index.js";

export const privacyRouter = Router();

privacyRouter.get("/settings", (req, res) => {
  const row = db
    .prepare("SELECT private_mode, biometric_lock FROM privacy_settings WHERE user_id = ?")
    .get(req.userId!) as { private_mode: number; biometric_lock: number } | undefined;
  res.json({
    privateMode: Boolean(row?.private_mode),
    biometricLock: Boolean(row?.biometric_lock),
  });
});

privacyRouter.put("/settings", (req, res) => {
  const { privateMode, biometricLock } = req.body as {
    privateMode?: boolean;
    biometricLock?: boolean;
  };
  db.prepare(
    `INSERT INTO privacy_settings (user_id, private_mode, biometric_lock, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       private_mode = excluded.private_mode,
       biometric_lock = excluded.biometric_lock,
       updated_at = excluded.updated_at`
  ).run(req.userId!, privateMode ? 1 : 0, biometricLock ? 1 : 0, nowIso());
  res.json({ privateMode: Boolean(privateMode), biometricLock: Boolean(biometricLock) });
});

/** Apaga a realidade principal inteira (e cenas/eventos vinculados a ela), mantendo o resto da conta. */
privacyRouter.delete("/reality", (req, res) => {
  const userId = req.userId!;
  const reality = db
    .prepare("SELECT id FROM realities WHERE user_id = ? AND is_primary = 1")
    .get(userId) as { id: string } | undefined;
  if (!reality) {
    res.status(404).json({ error: "Nenhuma realidade principal para apagar." });
    return;
  }
  db.prepare("DELETE FROM realities WHERE id = ?").run(reality.id);
  res.status(204).send();
});

privacyRouter.get("/export", (req, res) => {
  const userId = req.userId!;
  const tables = [
    "profiles",
    "identity_dna",
    "realities",
    "bridge_events",
    "journal_entries",
    "challenges",
    "identity_patterns",
    "assumed_self_messages",
    "privacy_settings",
  ];
  const data: Record<string, unknown> = {};
  for (const table of tables) {
    data[table] = db.prepare(`SELECT * FROM ${table} WHERE user_id = ?`).all(userId);
  }
  res.json(data);
});

privacyRouter.delete("/account", (req, res) => {
  db.prepare("DELETE FROM users WHERE id = ?").run(req.userId!);
  res.status(204).send();
});
