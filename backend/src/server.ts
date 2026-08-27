import "dotenv/config";
import cors from "cors";
import express from "express";
import { requireUser } from "./middleware/currentUser.js";
import { usersRouter } from "./routes/users.js";
import { onboardingRouter } from "./modules/onboarding/routes.js";
import { identityRouter } from "./modules/identity/routes.js";
import { realityRouter } from "./modules/reality/routes.js";
import { assumedSelfRouter } from "./modules/assumedSelf/routes.js";
import { journalRouter } from "./modules/journal/routes.js";
import { challengesRouter } from "./modules/challenges/routes.js";
import { evidenceRouter } from "./modules/evidence/routes.js";
import { crisisRouter } from "./modules/crisis/routes.js";
import { privacyRouter } from "./modules/privacy/routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/users", usersRouter);

app.use("/api/onboarding", requireUser, onboardingRouter);
app.use("/api/identity", requireUser, identityRouter);
app.use("/api/realities", requireUser, realityRouter);
app.use("/api/assumed-self", requireUser, assumedSelfRouter);
app.use("/api/journal", requireUser, journalRouter);
app.use("/api/challenges", requireUser, challengesRouter);
app.use("/api/evidence", requireUser, evidenceRouter);
app.use("/api/crisis", requireUser, crisisRouter);
app.use("/api/privacy", requireUser, privacyRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const message = err instanceof Error ? err.message : "Erro interno.";
  res.status(500).json({ error: message });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`JÁ É backend rodando em http://localhost:${port}`);
  console.log(
    process.env.ANTHROPIC_API_KEY
      ? "Usando AnthropicProvider (IA real)."
      : "ANTHROPIC_API_KEY não definida — usando MockProvider (offline/determinístico)."
  );
});
