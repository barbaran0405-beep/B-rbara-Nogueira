# JÁ É, versão pessoal (Artifact do Claude)

Versão do app para uso pessoal diário, publicada como Artifact no claude.ai:
https://claude.ai/artifact/X41xcEUTPNLYQZJJwEkFUj

- Roda dentro do Claude (app do celular ou navegador), em Android ou iPhone. Não precisa de servidor, build nem chave da Anthropic.
- Funciona inteiro SEM IA por padrão: cenas, desafios e perguntas do eu assumido vêm de bancos escritos à mão no próprio `index.html`, e o DNA assumido é escrito pela pessoa. Assim não gasta o limite do plano Claude.
- A IA é opcional (interruptor em Privacidade, desligado por padrão) e usa a capacidade `sample` do Artifact, que gasta o limite do plano de quem abre. Os prompts e as regras de segurança são os mesmos de `backend/src/ai/` (GUARDRAILS, DNA, mundo, cena, recap, eu assumido, padrões, desafio, modo crise).
- Os dados ficam na capacidade `db`, em `data/users/<id>/perfil` e nas subcoleções `cenas`, `diario`, `desafios` e `conversa`, numa área privada de quem usa.
- Fora do Claude, cai num modo local (localStorage) e avisa que a IA não está disponível.

Para atualizar: editar `index.html` e republicar no mesmo Artifact.
