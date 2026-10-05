# Roteiro de apresentação — Credenciamento de ICTs

**Duração-alvo:** 4min30s a 5min. **Estimativa:** ~4min50s (cerca de 650 palavras faladas, ritmo calmo).
**Como usar:** leia uma vez e conte com as suas palavras. O que está em *itálico* no fim de cada bloco é a ponte para o próximo slide: ela é o que faz virar uma história, não uma lista.
**Base de status:** GitHub em 05/10/2026 (conferido de novo antes deste roteiro; sem mudanças).
**Observação:** onde a fala diz "você", está falando com o Heitor. Na versão para a gerência, troque por "o mentor" ou "o Heitor".

---

## 01 · Abertura — 15 s
"O projeto que a gente está construindo se chama Credenciamento de ICTs. ICT é Instituição Científica, Tecnológica e de Inovação, ou seja, as instituições que fazem pesquisa e inovação. Em uma frase: a gente quer criar um jeito confiável de registrar e consultar se uma instituição está credenciada."

*Mas para isso fazer sentido, vale começar pelo problema.*

## 02 · O problema — 30 s
"Imagina que alguém precisa saber: essa instituição está credenciada agora? Parece simples, mas o credenciamento não é um carimbo único. A instituição se cadastra, pede a habilitação, é analisada, recebe o credenciamento por um prazo, pode ser auditada e depois precisa renovar. Hoje, para responder com segurança, alguém precisa conferir tudo isso manualmente."

*Foi daí que veio a nossa ideia.*

## 03 · A ideia — 20 s
"A ideia foi a seguinte: cada etapa importante fica registrada, com data e responsável. E qualquer pessoa consegue consultar a situação atual da instituição, sem cadastro e sem login."

*Na prática, funciona assim.*

## 04 · Como funciona — 40 s
"Primeiro, a instituição é cadastrada no sistema. Depois, ela solicita o credenciamento, e o responsável analisa e decide. Se for aprovada, recebe o credenciamento com prazo de validade. Com o tempo, pode passar por auditoria e renovação. E, no final, qualquer pessoa consulta a situação atual.
Já aproveito para mostrar onde estamos: o cadastro está pronto, e os outros cinco passos já foram construídos e estão em revisão. Você já olhou e a gente está fazendo os ajustes que você pediu."

*Agora, por que usar blockchain nisso?*

## 05 · Por que blockchain? — 25 s
"Por um motivo bem direto: as decisões do credenciamento precisam deixar histórico. Cada registro mostra o que aconteceu, quando e quem fez, e esse histórico não pode ser reescrito depois. E tem um cuidado: documentos completos e dados pessoais não ficam públicos. Lembrando que, por enquanto, é uma prova de conceito, com dados de teste."

*Só que a gente não saiu programando.*

## 06 · Como planejamos — 25 s
"Antes de desenvolver, a gente planejou. Partiu do problema, definiu as regras do sistema, mapeou os riscos, decidiu quem pode fazer cada ação e dividiu o trabalho em 15 tarefas. Só depois começou a construir. E cada entrega é testada e revisada antes de entrar no projeto."

*E essa divisão ficou assim.*

## 07 · Nosso time — 30 s
"O Lukas cuida das regras, dos riscos e de parte do fluxo de credenciamento: ativação, auditoria e consulta pública. O Gabriel cuida da entrada da instituição, o cadastro e a solicitação. A Alison cuida das regras de autorização, de quem pode fazer o quê, e da base de usuários. O Kaique cuida da experiência web, o site público e a área interna. E o Heitor faz a mentoria, a revisão e a aprovação."

*Com essa divisão, o que a gente já consegue mostrar?*

## 08 · O que já construímos — 35 s
"Já temos resultados concretos. As regras do sistema estão definidas, os principais riscos estão mapeados e as regras de autorização também. O site público e a área interna já existem, e o cadastro da instituição está implementado. Também temos a base inicial de usuários implementada, mas aqui eu prefiro ser honesto: a validação final ainda está pendente, então não vou chamar de concluída."

*Então, olhando o projeto como um todo, onde a gente está hoje?*

## 09 · Onde estamos agora — 25 s
"Em quatro frentes. No planejamento, 4 de 4 entregas concluídas. No fluxo de credenciamento, uma etapa aprovada e quatro em revisão. Em sistema e usuários, a base está implementada, mas faltam o login e o resto. E na experiência web, site público e área interna prontos, falta o login. Resumindo: a gente está saindo da construção das peças para começar a conectá-las."

*E conectar as peças é exatamente o que vem agora.*

## 10 · Próximos passos — 25 s
"Primeiro, concluir os ajustes das etapas em revisão, que é o Gabriel e o Lukas. Depois, implementar o login e o resto do sistema, com o Lukas. Em seguida, conectar interface, sistema e registros do credenciamento, com o Kaique e o Lukas. Aí a gente testa o fluxo completo e prepara a demonstração da primeira versão, o MVP. Esses dois últimos são da equipe toda."

*E o resultado que a gente quer entregar é este.*

## 11 · Resultado esperado — 15 s
"Uma pessoa consulta uma ICT, vê a situação atual e consegue confiar no histórico que levou até ali. A gente quer transformar um processo complexo em uma consulta simples, confiável e rastreável. Obrigado."

---

## Tempo

| Slide | Tempo |
|---|---|
| 01 Abertura | 0:15 |
| 02 O problema | 0:30 |
| 03 A ideia | 0:20 |
| 04 Como funciona | 0:40 |
| 05 Por que blockchain? | 0:25 |
| 06 Como planejamos | 0:25 |
| 07 Nosso time | 0:30 |
| 08 O que já construímos | 0:35 |
| 09 Onde estamos agora | 0:25 |
| 10 Próximos passos | 0:25 |
| 11 Resultado esperado | 0:15 |
| **Total** | **4:50** |

---

## 10 perguntas prováveis do Heitor

**1. O que exatamente já funciona?**
Já está aprovado: o cadastro oficial da instituição, o site público, a área interna e toda a parte de regras e riscos. As outras etapas do fluxo (solicitação e decisão, ativação, auditoria e renovação, consulta) já estão construídas e com os testes passando, mas ainda em revisão, então não chamo de pronto. A base de usuários está implementada, com validação final pendente.

**2. Por que blockchain?**
Porque o credenciamento precisa de um histórico confiável. Cada decisão importante fica registrada com data e responsável, e depois não dá para reescrever. Assim, quem consulta não depende de uma base controlada por uma única pessoa.

**3. O que ainda falta?**
Concluir os ajustes das quatro etapas em revisão, fazer o login e o resto do sistema, conectar o site, o sistema e os registros, testar o fluxo completo e preparar a demonstração da primeira versão.

**4. Qual foi a maior dificuldade?**
Manter as etapas do fluxo encadeadas: cada uma depende da anterior, então quando a primeira teve conflito e pedidos de ajuste, as outras precisaram acompanhar. *(Esta resposta foi tirada do que aparece no repositório. Se a dificuldade que o grupo sentiu foi outra, use a sua.)*

**5. Por que algumas partes ainda estão em revisão?**
Porque você apontou ajustes: faltavam testes para provar algumas regras, uma regra de solicitação estava mais restritiva do que o combinado e um caso do status da consulta pública estava errado. A gente está corrigindo antes da aprovação, que é para isso que a revisão serve.

**6. Como as partes do grupo se conectam?**
É uma cadeia: o cadastro vem antes da solicitação, que vem antes da decisão, da ativação, da auditoria e renovação e da consulta. Por isso essas etapas foram feitas em sequência. O site e o sistema de usuários se conectam ao fluxo no próximo passo, com login e integração.

**7. Como vocês garantem que ninguém altera um registro antigo?**
Cada decisão fica gravada na blockchain com data e responsável. Se algo muda, como uma renovação ou uma nova auditoria, isso vira um novo registro ligado ao anterior, e o anterior continua lá. Uma segunda auditoria, por exemplo, não apaga a primeira.

**8. O que fica público?**
A situação atual da instituição, que qualquer pessoa consulta sem login. Documentos completos e dados pessoais não ficam públicos: na blockchain vão só identificadores e uma "impressão digital" dos documentos, e os arquivos ficam em armazenamento privado.

**9. O que acontece depois que uma ICT é credenciada?**
O credenciamento tem prazo de validade. Nesse período ela pode ser auditada: o resultado é registrado, mas sozinho não derruba o credenciamento. Quando o prazo acaba, a situação passa a "vencida", e dá para renovar, ligando a nova habilitação à anterior.

**10. Quando teremos o fluxo completo?**
Não tenho uma data fechada. O caminho é: concluir as quatro etapas em revisão, fazer o login e o resto do sistema, conectar tudo e testar o fluxo completo. *(Se o grupo tiver uma estimativa, é o momento de dizê-la.)*

---

## Checagem antes de apresentar

- **T-007, T-008, T-009, T-010:** se o Heitor aprovar alguma, ela deixa de ser "em revisão". Atualize os slides 04, 09 e 10 e as falas desses blocos.
- **T-011 (base de usuários):** segue "implementada, validação final pendente" até ser confirmada com a Alison.
- **T-012, T-013, T-015:** ainda planejadas. Se alguém começar, ajuste o slide 09.
