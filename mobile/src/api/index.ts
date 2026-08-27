import { api, setUserId } from "./client";
import type {
  AssumedSelfMessage,
  BridgeEvent,
  Challenge,
  CrisisReframe,
  DNA,
  JournalEntry,
  OnboardingAnswers,
  Scene,
  WorldState,
} from "./types";

export * from "./types";
export { getUserId, clearUserId, ApiError } from "./client";

export async function createUser(displayName: string) {
  const user = await api.post<{ id: string; displayName: string }>(
    "/api/users",
    { displayName },
    false
  );
  await setUserId(user.id);
  return user;
}

export const onboardingApi = {
  status: () =>
    api.get<{ onboardingComplete: boolean; dna: DNA | null; hasPrimaryReality: boolean }>(
      "/api/onboarding/status"
    ),
  submit: (answers: OnboardingAnswers) =>
    api.post<{ dna: DNA }>("/api/onboarding", answers),
};

export const identityApi = {
  getDNA: () => api.get<DNA & { version: number }>("/api/identity/dna"),
  getPatterns: () => api.get<{ patterns: string[] }>("/api/identity/patterns"),
};

export const realityApi = {
  create: (area: string, tercaFeiraIdeal: string) =>
    api.post<{ id: string; area: string; worldState: WorldState }>("/api/realities", {
      area,
      tercaFeiraIdeal,
    }),
  primary: () =>
    api.get<{ id: string; area: string; worldState: WorldState }>("/api/realities/primary"),
  enter: () => api.post<{ scene: Scene }>("/api/realities/enter"),
  choose: (sceneId: string, optionId: string) =>
    api.post<{ scene: Scene }>(`/api/realities/scenes/${sceneId}/choice`, { optionId }),
};

export const assumedSelfApi = {
  messages: () => api.get<{ messages: AssumedSelfMessage[] }>("/api/assumed-self/messages"),
  send: (content: string) =>
    api.post<{ reply: string }>("/api/assumed-self/messages", { content }),
};

export const journalApi = {
  list: () => api.get<{ entries: JournalEntry[] }>("/api/journal"),
  add: (content: string, category: string) =>
    api.post<{ id: string; newPatterns: string[] }>("/api/journal", { content, category }),
};

export const challengesApi = {
  list: () => api.get<{ challenges: Challenge[] }>("/api/challenges"),
  generate: () =>
    api.post<{ id: string; description: string; status: string }>("/api/challenges/generate"),
  close: (id: string, done: boolean, reflection?: string) =>
    api.post<{ status: string }>(`/api/challenges/${id}/close`, { done, reflection }),
};

export const evidenceApi = {
  list: () => api.get<{ evidence: BridgeEvent[] }>("/api/evidence"),
  bridge: () => api.get<{ events: BridgeEvent[] }>("/api/evidence/bridge"),
};

export const crisisApi = {
  reframe: (fato: string) => api.post<CrisisReframe>("/api/crisis", { fato }),
};

export const privacyApi = {
  getSettings: () =>
    api.get<{ privateMode: boolean; biometricLock: boolean }>("/api/privacy/settings"),
  updateSettings: (privateMode: boolean, biometricLock: boolean) =>
    api.put("/api/privacy/settings", { privateMode, biometricLock }),
  deleteReality: () => api.delete("/api/privacy/reality"),
  exportData: () => api.get<Record<string, unknown>>("/api/privacy/export"),
  deleteAccount: () => api.delete("/api/privacy/account"),
};
