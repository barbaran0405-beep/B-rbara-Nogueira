export interface OnboardingAnswers {
  rotina: string;
  trabalho: string;
  financas: string;
  relacionamentos: string;
  autoimagem: string;
  desejaMudar: string;
  medos: string;
  crencasDinheiro: string;
  crencasAmor: string;
  crencasSucesso: string;
  reacaoAoErro: string;
  padroesRepetidos: string;
  tercaFeiraIdeal: string;
}

export interface DNA {
  atual: string;
  assumido: string;
}

export interface WorldState {
  resumo: string;
  ambiente: string;
  rotina: string;
  profissao: string;
  relacoes: string;
  lazer: string;
}

export interface SceneOption {
  id: string;
  label: string;
}

export interface Scene {
  narrative: string;
  options: SceneOption[];
}

export interface NarrativeContext {
  area: string;
  dna: DNA;
  worldState: WorldState;
  recentNarrative: string[];
  patterns: string[];
}

export interface CrisisReframe {
  interpretacao: string;
  medo: string;
  padraoAntigo: string;
  respostaIdentidadeAssumida: string;
}

export interface AIProvider {
  generateDNA(answers: OnboardingAnswers): Promise<DNA>;
  generateWorldState(area: string, tercaFeiraIdeal: string, dna: DNA): Promise<WorldState>;
  generateScene(ctx: NarrativeContext, lastChoiceLabel?: string): Promise<Scene>;
  generatePendingRecap(ctx: NarrativeContext, hoursAway: number): Promise<string>;
  assumedSelfReply(ctx: NarrativeContext, history: { role: string; content: string }[], userMessage: string): Promise<string>;
  detectPatterns(entries: string[]): Promise<string[]>;
  generateChallenge(ctx: NarrativeContext): Promise<string>;
  crisisReframe(ctx: NarrativeContext, fato: string): Promise<CrisisReframe>;
}
