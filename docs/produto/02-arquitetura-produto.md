# JÁ É — Arquitetura de Produto

> Baseado em `01-analise-estrategica.md`. Descreve a arquitetura completa (produto + técnica) e onde o MVP corta escopo. Nenhum código foi escrito ainda — este é o desenho antes da implementação.

---

## 1. Visão de sistema

```
┌───────────────────────────────────────────────────────────────────────┐
│                          APP MOBILE (cliente)                         │
│  Camada de Experiência: Home minimalista, Modo Realidade, Journal,    │
│  Eu Assumido, Modo Crise, Banco de Evidências, Modo Noturno/SATS       │
└───────────────────────────────────────────────────────────────────────┘
                │ (API autenticada, streaming de narrativa/áudio)
┌───────────────────────────────────────────────────────────────────────┐
│                        BACKEND DE ORQUESTRAÇÃO                        │
│  Reality Engine · Memory & Pattern Service · Identity Graph ·         │
│  Journal Service · Challenge Scheduler · Notification Governor        │
└───────────────────────────────────────────────────────────────────────┘
                │                         │                    │
┌───────────────────────┐   ┌─────────────────────────┐  ┌──────────────┐
│  IA Generativa (LLM)   │   │  Áudio (TTS/soundscape)  │  │ Imagem (v2+) │
│  narrativa, persona,   │   │  Modo Noturno, chamada   │  │ Dream Studio │
│  padrões, retrospectiva│   │  do Eu Assumido          │  │ Identidade   │
└───────────────────────┘   └─────────────────────────┘  └──────────────┘
                │
┌───────────────────────────────────────────────────────────────────────┐
│                    ARMAZENAMENTO (por usuário, criptografado)          │
│  Perfil · DNA Atual/Assumido · Realidades · Cenas · Eventos ·          │
│  Journal · Evidências · Grafo Causal · Preferências de Privacidade     │
└───────────────────────────────────────────────────────────────────────┘
```

Princípio de design de sistema: **o backend nunca expõe a lógica narrativa como uma API de "chat genérico"**. Cada chamada à IA carrega um pacote de contexto estruturado (perfil, DNA, estado do mundo, últimos eventos, padrões detectados) montado pelo *Reality Engine* — a personalização não é prompt solto, é dado estruturado + instrução.

## 2. Módulos funcionais

### 2.1 Onboarding & Identidade (itens 3–5)
- **Conversation Engine**: fluxo conversacional guiado (não formulário), com perguntas adaptativas — se o usuário responde algo relevante fora de ordem, o motor pula perguntas já respondidas.
- **Reality Selector**: força escolha de uma realidade principal via a pergunta de maior impacto; interface esconde a opção de criar uma segunda realidade até marco de consistência (ex.: 3–4 semanas de prática).
- **Identity DNA Builder**: a partir das respostas, gera DNA Atual (crenças relatadas, padrões, medos) e DNA Assumido (identidade-alvo: crenças funcionais, comportamentos, rotina, linguagem). Sempre rotulado como "padrões que você relatou", nunca como diagnóstico.

### 2.2 Reality Engine — Modo Realidade (itens 6–10, 23–24)
- Constrói o "mundo" da realidade escolhida (ambiente, rotina, relações, trabalho, lazer) como um documento de mundo versionado.
- Narrativa ramificada: cada decisão do usuário grava uma transição de estado no mundo (grafo de estados, não árvore fixa — estados podem convergir).
- **Continuidade assíncrona**: um job (worker) avança o "relógio do mundo" mesmo com o app fechado, gerando eventos pendentes ("enquanto você esteve fora"), sempre rotulados como continuação narrativa, nunca como afirmação sobre a vida real do usuário.
- **Realidade Contrária**: motor injeta periodicamente cenários de tensão alinhados à identidade-alvo (negociação, limite, rejeição) calibrados por área de vida.
- **"E se?"**: ramo de simulação isolado e explicitamente rotulado como exploratório, não previsão — não persiste no estado principal do mundo.
- **"Um dia da minha vida"**: template de simulação de dia completo ancorado num horizonte temporal escolhido pelo usuário (ex.: 1 ano), reaproveitando o mesmo motor narrativo com um roteiro de "arco de dia".

### 2.3 Eu Assumido (itens 13–14)
- Persona de IA com acesso ao Identity Graph (padrões, marcos, histórico) e ao DNA Assumido.
- Modos: texto, voz assíncrona (mensagem), voz em tempo real ("chamada") — v2.
- Guardrail textual permanente no *system prompt* da persona: ela se apresenta como representação da identidade em construção, nunca alega conhecer o futuro real ou ter poderes sobrenaturais.
- Rate limit de intimidade: a persona direciona de volta para ação real ("o que você já fez sobre isso?") em vez de validação ilimitada.

### 2.4 Espelho da Identidade & Padrões (item 12)
- Serviço de análise de linguagem sobre o Journal + escolhas no Modo Realidade, produzindo "padrões percebidos" (ex.: narrativa de dúvida recorrente) com citação das evidências (trechos), nunca como afirmação categórica.
- Alimenta o Identity Graph, que por sua vez alimenta a Realidade Contrária e o Desafio de Identidade.

### 2.5 Manifestation GPS (item 15)
- Não é um placar numérico. É uma tela narrativa com 6 seções qualitativas (Identidade, Pensamento, Ação, Consistência, Evidências, Direção), cada uma resumida em 1–2 frases geradas a partir do Identity Graph + Journal + Banco de Evidências, com link para o item de origem (auditável, nunca "número mágico").

### 2.6 Bridge of Events / Journal / Banco de Evidências (itens 16–17, 27)
- Estrutura de dado única de "evento" com 4 campos separados e obrigatórios: **Acontecimento** (fato), **Interpretação** (o que o usuário atribuiu), **Ação** (o que ele fez), **Evidência/Resultado** (o que mudou, se algo mudou).
- Journal é a interface de captura (texto/voz); Banco de Evidências é uma visão filtrada de eventos marcados como evidência de progresso; Bridge of Events é a visão de linha do tempo causal completa.

### 2.7 Revisão / SATS / Modo Noturno (itens 18–19)
- **Modo Revisão**: fluxo guiado de reescrita narrativa de um evento passado, sempre perguntando primeiro "como você gostaria de ter vivido" e depois "o que isso diz sobre você" — não sobrescreve o evento original, cria uma revisão vinculada a ele (o fato original nunca é apagado).
- **SATS/Modo Noturno**: geração de cena curta e específica (texto detalhado de ambiente/sensações) + TTS + trilha sonora combinada dinamicamente a partir de tags emocionais da cena. V1 pode ser só áudio de narração + biblioteca curada de ambientes sonoros (mais barato e mais rápido que gerar soundscape do zero).

### 2.8 Dream Studio & Identidade Visual (itens 20, 29) — V2
- Geração de imagem (não vídeo em V2) a partir de descrição da cena, com narrativa e áudio acoplados.
- Identidade Visual como moodboard gerado (roupas, ambiente, estética), não avatar 3D.

### 2.9 Realidade Aumentada (item 21) — V3, opcional
- Módulo isolado, ativado por feature flag, sem dependência do núcleo. Overlay 2D/3D leve sobre câmera, sem exigir fotorrealismo perfeito no lançamento.

### 2.10 Treinamento de Identidade / Desafio Semanal (itens 11, 24)
- Biblioteca de cenários por área de vida (dinheiro, amor, carreira, autoconfiança), calibrados por DNA Assumido + padrões detectados.
- Desafio semanal: um item pequeno e concreto gerado a partir do cenário mais relevante da semana, com fechamento explícito no app (usuário registra o que fez) que retroalimenta o Banco de Evidências.

### 2.11 Reality Check & Notification Governor (item 25)
- Serviço separado que decide *se* e *quando* notificar, com teto rígido de frequência e redução automática baseada em taxa de dismiss/abertura — trata frequência de notificação como orçamento, não como canal ilimitado.

### 2.12 Modo Crise (item 26)
- Fluxo estruturado e não-"positivo por padrão": Fato → Interpretação → Medo → Padrão Antigo → Resposta da Identidade Assumida. Sempre acessível por um botão fixo, nunca atrás de fluxo narrativo.

### 2.13 Biografia da Transformação (item 28) — V2, requer meses de histórico
- Gerada a partir do Identity Graph + Bridge of Events, como narrativa retrospectiva (não estatística), disparada em marcos temporais (ex.: 90 dias), nunca diária.

### 2.14 Realidade Financeira Simulada & Relacionamentos (itens 30–31) — escopo reduzido
- V1/V2: reflexões pontuais dentro do Journal/cenários de treinamento, sem minigame de economia separado (ver análise item 3–4).
- Relacionamentos: cenários de treinamento (comunicação, limites, confiança), nunca companion romântico.

### 2.15 Memória & Privacidade (itens 32–33)
- Identity Graph é o sistema de memória central; usuário tem tela de controle total: ver o que é lembrado, apagar itens específicos, apagar uma realidade inteira, exportar tudo, modo privado (sessão sem gravação), biometria para abrir o app.
- Toda geração de IA que usa memória do usuário passa por um *memory contract* explícito: nada é enviado a serviços de terceiros além do necessário para gerar a resposta da sessão atual (sem treinamento de modelos de terceiros com dados do usuário).

## 3. Modelo de dados (alto nível)

```
User
 ├── Profile (respostas de onboarding, preferências)
 ├── IdentityDNA { atual, assumido }
 ├── Reality (1 principal + N secundárias pós-consistência)
 │    ├── WorldState (documento versionado: ambiente, rotina, relações, trabalho)
 │    ├── SceneLog (histórico de cenas do Modo Realidade + decisões)
 │    └── PendingEvents ("enquanto você esteve fora")
 ├── IdentityGraph (padrões detectados, marcos, versões do DNA ao longo do tempo)
 ├── BridgeEvent[] { acontecimento, interpretação, ação, evidência, timestamp, origem }
 ├── JournalEntry[] (texto/voz, categorizado: desejo/emoção/crença/acontecimento/evidência/ação/revisão)
 ├── Challenge[] (semanal, status, vínculo com BridgeEvent de fechamento)
 └── PrivacySettings (memória, exportação, biometria, exclusão por realidade)
```

## 4. Camada de IA — contrato de orquestração

Toda chamada ao modelo de linguagem segue o mesmo contrato, independente do módulo:

1. **Contexto estruturado** montado pelo backend: perfil resumido, DNA relevante, últimos N eventos do WorldState/BridgeEvent, padrões ativos do IdentityGraph.
2. **Instrução de papel** específica do módulo (narrador, persona Eu Assumido, analista de padrões, gerador de desafio) com guardrails fixos: nunca afirmar controle sobre eventos externos reais; sempre distinguir fato de interpretação; nunca usar linguagem de profecia/determinismo.
3. **Saída estruturada** (não texto livre solto): a narrativa vem acompanhada de metadados (quais opções o usuário pode escolher, que categoria de padrão está sendo tocada) para a interface renderizar sem re-parsing frágil.

Isso é o que torna "personalização extrema" (item 38) sustentável: a variação vem do contexto injetado, não de prompts distintos por usuário.

## 5. Stack tecnológico proposto

| Camada | Escolha recomendada | Motivo |
|---|---|---|
| Mobile | React Native (ou Flutter) | Um único codebase para iOS/Android, animações fluidas suficientes para a estética minimalista/cinematográfica pedida |
| Backend | Serviço de orquestração em Node.js ou Python (FastAPI) | Boa integração com SDKs de IA e workers assíncronos |
| Fila/worker (mundo persistente) | Fila de jobs (ex. worker assíncrono) para avançar o WorldState mesmo com app fechado | Necessário para "enquanto você esteve fora" |
| IA generativa (texto) | Modelo de linguagem de ponta via API, com *system prompts* por módulo + RAG sobre o Identity Graph | Já viável hoje, ver análise item 9 |
| Áudio (TTS) | API de TTS expressivo | Modo Noturno, mensagens do Eu Assumido |
| Imagem (V2) | API de geração de imagem | Dream Studio, Identidade Visual |
| AR (V3) | ARKit / ARCore | Isolado, opcional |
| Banco de dados | Banco relacional para dados estruturados (perfil, eventos, desafios) + armazenamento de objetos para áudio/imagem | Consultas relacionais (grafo causal, journal) + assets binários |
| Criptografia | Dados sensíveis (journal, DNA) criptografados em repouso; biometria local para desbloqueio | Requisito de privacidade item 33 |

## 6. Sistema anti-dependência como componente de arquitetura (não só princípio)

Implementado como um serviço observador (*Wellbeing Guardrail*) que:
- Monitora razão simulação/ação (tempo em Modo Realidade vs. registros de BridgeEvent com Ação preenchida).
- Se a razão cair (muita simulação, pouca ação), reduz a oferta de conteúdo de simulação e aumenta a saliência do Desafio de Identidade e do botão "Estou Duvidando" só quando fizer sentido — nunca bloqueia o app, apenas rebalanceia o que é sugerido na Home.
- Nunca implementa streak numérico visível nem mensagens de perda ("você vai perder sua manifestação").

## 7. Roadmap de implementação

- **MVP** (ver análise item 13): Onboarding, DNA, 1 Realidade, Modo Realidade em texto, Eu Assumido em texto, Journal, Desafio Semanal, Banco de Evidências, Modo Crise, Privacidade básica.
- **V1**: Reality Check + Notification Governor, Espelho da Identidade, Modo Revisão, SATS com áudio, Manifestation GPS.
- **V2**: Eu Assumido por voz/chamada, Dream Studio (imagem+áudio), Identidade Visual, múltiplas realidades, Biografia da Transformação.
- **V3**: AR opcional, relacionamentos mais ricos, reflexão financeira leve, co-narração consentida com terceiros.

---

Próximo passo, quando solicitado: transformar a seção "MVP" em backlog técnico detalhado (telas, endpoints, schema de banco) e iniciar a implementação.
