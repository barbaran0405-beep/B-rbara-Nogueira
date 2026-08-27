# JÁ É

> Não imagine a vida dos seus sonhos. Experimente vivê-la.

Este repositório contém a concepção e (progressivamente) a implementação do **JÁ É**, um aplicativo de "Immersive Identity Experience": um ciclo contínuo de imaginação → identidade → simulação → decisão → ação → evidência → revisão → evolução.

## Documentação de produto

- [`docs/produto/01-analise-estrategica.md`](docs/produto/01-analise-estrategica.md) — o que é inovador, o que já existe no mercado, o que deve ser cortado, riscos de dependência e mitigação, viabilidade técnica, escopo de MVP vs. produto completo, e diferencial competitivo defensável.
- [`docs/produto/02-arquitetura-produto.md`](docs/produto/02-arquitetura-produto.md) — arquitetura completa do sistema (módulos, modelo de dados, camada de IA, stack tecnológico, roadmap MVP → V3).

## Estado atual

MVP implementado e testado ponta a ponta (onboarding → DNA → realidade única → Modo Realidade com mundo persistente → Eu Assumido → Diário → Desafio de Identidade → Banco de Evidências → Modo Crise → Privacidade):

- `backend/` — API em Express + TypeScript + SQLite. Camada de IA plugável: usa a API da Anthropic se `ANTHROPIC_API_KEY` estiver definida, ou um `MockProvider` determinístico (offline, sem custo) caso contrário — útil para desenvolver e testar sem chave.
- `mobile/` — app em Expo/React Native (funciona em iOS, Android e Web) com as telas do MVP, estética cinematográfica/minimalista conforme a arquitetura.

### Rodando localmente

```bash
# backend
cd backend
npm install
npm run dev        # sobe em http://localhost:4000 (modo mock por padrão)

# mobile (em outro terminal)
cd mobile
npm install
npm run web         # ou: npm run ios / npm run android
```

Para usar IA real em vez do modo mock, copie `backend/.env.example` para `backend/.env` e defina `ANTHROPIC_API_KEY`.

## Próximos passos

V1 conforme o roadmap da arquitetura: Reality Check com notificações inteligentes, Espelho da Identidade, Modo Revisão, SATS com áudio, Manifestation GPS.
