import type {
  AIProvider,
  CrisisReframe,
  DNA,
  NarrativeContext,
  OnboardingAnswers,
  Scene,
  WorldState,
} from "./types.js";

/**
 * Provider determinístico, sem dependência de rede ou chave de API.
 * Usado automaticamente quando ANTHROPIC_API_KEY não está configurada —
 * permite desenvolver e testar o ciclo completo do produto offline.
 * Não é "genérico": interpola os dados reais fornecidos pelo usuário.
 */
export class MockProvider implements AIProvider {
  async generateDNA(answers: OnboardingAnswers): Promise<DNA> {
    const atual = [
      `Você relatou uma rotina descrita como "${answers.rotina}", com uma relação com dinheiro marcada por "${answers.crencasDinheiro}".`,
      `Diante de erros, você tende a "${answers.reacaoAoErro}", e um padrão que você mesmo notou se repetindo é: "${answers.padroesRepetidos}".`,
      `O medo mais presente que você nomeou foi "${answers.medos}".`,
    ].join(" ");

    const assumido = [
      `A identidade que você está construindo age a partir de uma terça-feira como esta: "${answers.tercaFeiraIdeal}".`,
      `Essa versão sua trata sucesso como "${answers.crencasSucesso}" e trata os relacionamentos com a mesma postura que descreveu para "${answers.relacionamentos}", mas sem o padrão de "${answers.padroesRepetidos}".`,
      `Ela responde a imprevistos de um jeito diferente do seu "${answers.reacaoAoErro}" atual — com mais clareza sobre o que pode controlar.`,
    ].join(" ");

    return { atual, assumido };
  }

  async generateWorldState(area: string, tercaFeiraIdeal: string, dna: DNA): Promise<WorldState> {
    return {
      resumo: `Sua realidade de ${area}, construída a partir do que você descreveu: "${tercaFeiraIdeal}".`,
      ambiente: `Um ambiente coerente com a cena que você descreveu em "${tercaFeiraIdeal}".`,
      rotina: `Uma rotina que reflete a identidade assumida: ${dna.assumido.slice(0, 140)}...`,
      profissao: `Um contexto de trabalho/renda alinhado à área "${area}".`,
      relacoes: "Relações que respondem com naturalidade às escolhas que você fizer no Modo Realidade.",
      lazer: "Momentos de lazer que aparecem organicamente entre as cenas, sem serem forçados.",
    };
  }

  async generateScene(ctx: NarrativeContext, lastChoiceLabel?: string): Promise<Scene> {
    const continuation = lastChoiceLabel
      ? `Depois de "${lastChoiceLabel}", a cena continua. `
      : "";
    const narrative =
      `${continuation}${ctx.worldState.ambiente} ${ctx.worldState.rotina} ` +
      `Uma situação concreta da sua realidade de ${ctx.area} está diante de você agora.`;

    return {
      narrative,
      options: [
        { id: "a", label: "Agir com a postura da sua identidade assumida" },
        { id: "b", label: "Observar mais antes de decidir" },
        { id: "c", label: "Responder com cautela, do jeito antigo" },
      ],
    };
  }

  async generatePendingRecap(ctx: NarrativeContext, hoursAway: number): Promise<string> {
    return (
      `Enquanto você esteve fora (${hoursAway}h), sua realidade de ${ctx.area} continuou. ` +
      `Algo pequeno aconteceu — uma mensagem, uma decisão adiada, um sinal — coerente com "${ctx.worldState.resumo}". ` +
      `Isso não é uma previsão sobre sua vida real: é a continuação da sua narrativa simulada.`
    );
  }

  async assumedSelfReply(
    ctx: NarrativeContext,
    history: { role: string; content: string }[],
    userMessage: string
  ): Promise<string> {
    const lastPattern = ctx.patterns[ctx.patterns.length - 1];
    const patternNote = lastPattern
      ? ` Eu me lembro de um padrão que você já percebeu: "${lastPattern}". Vale olhar se ele está presente agora.`
      : "";
    return (
      `Eu sou a representação da identidade que você está construindo em ${ctx.area} — não uma versão que conhece seu futuro real. ` +
      `Sobre o que você disse ("${userMessage}"): o que você já fez a respeito, fora daqui?${patternNote}`
    );
  }

  async detectPatterns(entries: string[]): Promise<string[]> {
    if (entries.length === 0) return [];
    const last = entries[entries.length - 1];
    return [`Uma narrativa que aparece com frequência nos seus registros recentes: "${last.slice(0, 120)}"`];
  }

  async generateChallenge(ctx: NarrativeContext): Promise<string> {
    return (
      `Esta semana, faça uma ação pequena e concreta que sua identidade assumida em ${ctx.area} faria: ` +
      `algo que você tem adiado por causa do padrão antigo, e que caiba em menos de 20 minutos.`
    );
  }

  async crisisReframe(ctx: NarrativeContext, fato: string): Promise<CrisisReframe> {
    return {
      interpretacao: `O significado que pode estar sendo atribuído a "${fato}" é maior do que o fato em si.`,
      medo: `Por trás disso pode estar o medo que você já nomeou: "${ctx.patterns[0] ?? "não ter conseguido o suficiente"}".`,
      padraoAntigo: "O padrão antigo tenderia a reagir imediatamente, sem separar fato de interpretação.",
      respostaIdentidadeAssumida: `Sua identidade assumida em ${ctx.area} respiraria antes de reagir, e perguntaria: "o que é fato aqui, e o que eu estou adicionando?"`,
    };
  }
}
