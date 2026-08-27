import type { NextFunction, Request, Response } from "express";
import { db } from "../db/index.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/** Resolve o usuário a partir do header X-User-Id, exigido em toda rota autenticada do MVP. */
export function requireUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.header("X-User-Id");
  if (!userId) {
    res.status(401).json({ error: "Header X-User-Id é obrigatório." });
    return;
  }
  const exists = db.prepare("SELECT 1 FROM users WHERE id = ?").get(userId);
  if (!exists) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }
  req.userId = userId;
  next();
}
