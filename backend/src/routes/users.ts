import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db, nowIso } from "../db/index.js";

export const usersRouter = Router();

usersRouter.post("/", (req, res) => {
  const { displayName } = req.body as { displayName?: string };
  if (!displayName || typeof displayName !== "string") {
    res.status(400).json({ error: "displayName é obrigatório." });
    return;
  }
  const id = uuid();
  const createdAt = nowIso();
  db.prepare("INSERT INTO users (id, display_name, created_at) VALUES (?, ?, ?)").run(
    id,
    displayName,
    createdAt
  );
  db.prepare(
    "INSERT INTO privacy_settings (user_id, private_mode, biometric_lock, updated_at) VALUES (?, 0, 0, ?)"
  ).run(id, createdAt);
  res.status(201).json({ id, displayName, createdAt });
});
