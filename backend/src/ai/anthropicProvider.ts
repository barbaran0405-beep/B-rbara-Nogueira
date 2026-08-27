import Anthropic from "@anthropic-ai/sdk";
import { GUARDRAILS } from "./guardrails.js";
import type {
  AIProvider,
  CrisisReframe,
  DNA,
  NarrativeContext,
  OnboardingAnswers,
  Scene,
  WorldState,
} from "./types.js";

const MODEL = "claude-sonnet-5";

function extractJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Resposta do modelo não continha JSON: ${text}`);
  return JSON.parse(match[0]) as T;
}

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  private async ask(system: string, user: string): Promise<string> {
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `${GUARDRAILS}\n\n${system}`,
      messages: [{ role: "user", content: user }],
    });
    const block = response.content[0];
    return block.type === "text" ? block.text : "";
  }

  async generateDNA(answers: OnboardingAnswers): Promise<DNA> {
    const text = await this.ask(
      `Você constrói o "DNA Atual" e o "DNA Assumido" de um usuário a partir das respostas de onboarding.
Responda APENAS com um JSON no formato {"atual": "...", "assumido": "..."}, cada campo com 2-4 frases,
em português, na segunda pessoa, tratando tudo como "padrões relatados", nunca como diagnóstico.`,
      JSON.stringify(answers, null, 2)
    );
    return extractJson<DNA>(text);
  }

  async generateWorldState(area: string, tercaFeiraIdeal: string, dna: DNA): Promise<WorldState> {
    const text = await this.ask(
      `Construa o "mundo" de uma realidade simulada a partir da área de vida e da descrição de uma
terça-feira ideal do usuário. Responda APENAS com JSON:
{"resumo":"...","ambiente":"...","rotina":"...","profissao":"...","relacoes":"...","lazer":"..."}`,
      JSON.stringify({ area, tercaFeiraIdeal, dna })
    );
    return extractJson<WorldState>(text);
  }

  async generateScene(ctx: NarrativeContext, lastChoiceLabel?: string): Promise<Scene> {
    const text = await this.ask(
      `Você é o motor narrativo do "Modo Realidade". Gere a PRÓXIMA cena curta (2-4 frases) da vida
simulada do usuário, reagindo à última escolha dele se houver, e ofereça 3 opções de ação coerentes
com a identidade assumida, a identidade antiga, e uma opção intermediária de observação.
Responda APENAS com JSON: {"narrative":"...","options":[{"id":"a","label":"..."},{"id":"b","label":"..."},{"id":"c","label":"..."}]}`,
      JSON.stringify({ ctx, lastChoiceLabel })
    );
    return extractJson<Scene>(text);
  }

  async generatePendingRecap(ctx: NarrativeContext, hoursAway: number): Promise<string> {
    return this.ask(
      `Gere 2-3 frases descrevendo o que aconteceu na realidade simulada do usuário enquanto ele
esteve fora do app (${hoursAway} horas), como continuação narrativa coerente com o mundo dele.
Deixe claro que é continuação da simulação, não previsão da vida real. Responda em texto simples.`,
      JSON.stringify(ctx)
    );
  }

  async assumedSelfReply(
    ctx: NarrativeContext,
    history: { role: string; content: string }[],
    userMessage: string
  ): Promise<string> {
    const text = await this.ask(
      `Você é o "Eu Assumido": a representação da identidade que o usuário está construindo.
Responda à mensagem dele em 2-4 frases, em primeira pessoa, com calor e firmeza, sem positividade
tóxica, direcionando-o de volta para ação real quando fizer sentido. Nunca alegue conhecer o
futuro real dele. Contexto do usuário e histórico da conversa estão no JSON a seguir.`,
      JSON.stringify({ ctx, history, userMessage })
    );
    return text.trim();
  }

  async detectPatterns(entries: string[]): Promise<string[]> {
    const text = await this.ask(
      `Analise estes registros de diário e aponte até 3 padrões de linguagem/comportamento recorrentes,
citando trechos como evidência. Responda APENAS com JSON: {"patterns": ["...", "..."]}`,
      JSON.stringify(entries)
    );
    return extractJson<{ patterns: string[] }>(text).patterns;
  }

  async generateChallenge(ctx: NarrativeContext): Promise<string> {
    return this.ask(
      `Gere um Desafio de Identidade semanal: uma ação pequena, concreta e realizável em menos de
20 minutos, que a identidade assumida do usuário faria. Responda em uma frase, em texto simples.`,
      JSON.stringify(ctx)
    );
  }

  async crisisReframe(ctx: NarrativeContext, fato: string): Promise<CrisisReframe> {
    const text = await this.ask(
      `Modo Crise: dado um fato relatado pelo usuário, produza uma separação estruturada. Nunca use
positividade tóxica. Responda APENAS com JSON:
{"interpretacao":"...","medo":"...","padraoAntigo":"...","respostaIdentidadeAssumida":"..."}`,
      JSON.stringify({ ctx, fato })
    );
    return extractJson<CrisisReframe>(text);
  }
}
