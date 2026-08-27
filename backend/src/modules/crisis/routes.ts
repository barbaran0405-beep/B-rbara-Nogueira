import { Router } from "express";
import { getAIProvider } from "../../ai/index.js";
import { buildContext } from "../context.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const crisisRouter = Router();

/** ESTOU DUVIDANDO: separa fato / interpretação / medo / padrão antigo / resposta da identidade assumida. */
crisisRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.userId!;
    const { fato } = req.body as { fato?: string };
    if (!fato) {
      res.status(400).json({ error: "fato é obrigatório." });
      return;
    }
    const ctx = buildContext(userId);
    const reframe = await getAIProvider().crisisReframe(ctx, fato);
    res.json({ fato, ...reframe });
  })
);
