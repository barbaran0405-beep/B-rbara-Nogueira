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
  id: string;
  narrative: string;
  options: SceneOption[];
  answered: boolean;
  isPendingRecap: boolean;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  category: string;
  content: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  reality_id: string | null;
  description: string;
  status: "pending" | "done" | "skipped";
  closure_reflection: string | null;
  created_at: string;
  closed_at: string | null;
}

export interface BridgeEvent {
  id: string;
  acontecimento: string;
  interpretacao: string | null;
  acao: string | null;
  evidencia: string | null;
  is_evidence: number;
  origin: string;
  created_at: string;
}

export interface AssumedSelfMessage {
  role: "user" | "assumed_self";
  content: string;
  created_at: string;
}

export interface CrisisReframe {
  fato: string;
  interpretacao: string;
  medo: string;
  padraoAntigo: string;
  respostaIdentidadeAssumida: string;
}
