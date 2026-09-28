# Protótipo — Bloco 01 (Abertura)

Implementação isolada do **Bloco 01 — Abertura** da futura apresentação do MVP5. Este
diretório **não faz parte do produto** (`apps/`, `contracts/`) e não deve ser referenciado
por ele. É um protótipo de front-end estático, sem build step, para revisão visual antes de
avançar para o Bloco 02.

Fonte de verdade desta implementação, em ordem de prioridade:
1. [`../08-BLOCO-01-ABERTURA.md`](../08-BLOCO-01-ABERTURA.md) — especificação de conteúdo e composição
2. [`../09-CONCEPT-BLOCO-01.md`](../09-CONCEPT-BLOCO-01.md) — concept visual aprovado
3. [`../07-ARQUITETURA-DA-APRESENTACAO.md`](../07-ARQUITETURA-DA-APRESENTACAO.md) — arquitetura geral dos 13 blocos
4. [`../06-CONTEUDO-CANONICO-DA-APRESENTACAO.md`](../06-CONTEUDO-CANONICO-DA-APRESENTACAO.md) — dados factuais do projeto

## O que foi implementado

Só o Bloco 01, ponta a ponta:
- Texto exato aprovado (eyebrow, headline, subheadline, indicador de continuidade), sempre
  como HTML real no DOM — nunca desenhado dentro do canvas.
- Rede 3D abstrata em Three.js: clusters discretos de nós, conexões finas (algumas
  "parcialmente formadas", com traço tracejado), alguns nós com halo suave, alguns pontos
  soltos fora da estrutura principal — distribuídos do centro da tela para a direita.
- Composição assimétrica: texto à esquerda com grande área negativa, rede ao centro-direita,
  camada de gradiente (`scrim`) sutil garantindo contraste do texto independente de onde a
  rede esteja.
- Sequência de entrada (fade/rise escalonado: fundo → rede → eyebrow → título → subtítulo →
  indicador), implementada em CSS puro (sem GSAP — ver "Decisões técnicas").
- Parallax discreto: leve rotação automática muito lenta da rede + resposta sutil ao
  movimento do mouse (câmera, não a rede perseguindo o cursor). Desativado em telas com
  ponteiro grosso (touch) e quando `prefers-reduced-motion` está ativo.
- Responsividade real (não é o desktop encolhido): rede migra para uma faixa discreta no
  topo em telas ≤720px, conteúdo empilhado verticalmente, headline sempre dominante.
- `prefers-reduced-motion`: remove a animação de entrada e o parallax de mouse, mantendo
  layout e legibilidade completos.
- Fallback sem WebGL: se a criação do contexto WebGL falhar (ou `three.js` não carregar), a
  página aplica um fundo estático em CSS e esconde o canvas — texto e composição continuam
  funcionando normalmente.
- Pausa de renderização quando a aba fica oculta (`visibilitychange`) ou quando o hero sai da
  viewport (`IntersectionObserver`), para não gastar GPU à toa.

## Estrutura de arquivos

```text
docs/apresentacao/prototipo/
├── index.html   — estrutura semântica do bloco (conteúdo real + canvas decorativo)
├── styles.css   — layout, tipografia, responsividade, reduced-motion, fallback sem WebGL
├── main.js      — construção da rede 3D (Three.js), sequência de entrada, parallax, fallback
└── README.md    — este arquivo
```

Nenhum outro arquivo foi criado. Não há build step, bundler ou `package.json` — é HTML/CSS/JS
direto, carregando o Three.js via CDN (`cdn.jsdelivr.net`, versão fixa `0.160.0`, build UMD
global `THREE`).

## Como executar

O navegador bloqueia módulos/recursos ao abrir um `index.html` direto via `file://` em
alguns casos (CORS de `fetch`/workers do Three.js), então o mais confiável é servir a pasta
por HTTP local. Duas opções simples, a partir desta pasta:

```bash
# Opção 1 — Node (sem dependências extras)
npx --yes http-server . -p 8642
```

```bash
# Opção 2 — Python, se disponível
python -m http.server 8642
```

Depois, abrir `http://localhost:8642` no navegador. Abrir `index.html` diretamente por
duplo clique também tende a funcionar na maioria dos navegadores modernos (o Three.js aqui
não usa ES Modules nem workers), mas servir por HTTP é a forma recomendada e foi a usada
para validar esta implementação.

## Decisões técnicas

- **Three.js via `<script>` clássico (UMD), não ES Modules.** Prioriza compatibilidade
  máxima com abertura local simples, sem precisar de import maps. O console acusa um aviso
  de depreciação do build UMD (esperado a partir do Three.js r150+) — não afeta o
  funcionamento nesta versão (`0.160.0`) e não há erro.
- **Sem GSAP.** A sequência de entrada usa apenas `@keyframes` em CSS, ativada por uma classe
  (`data-motion="ready"`) que o JS aplica após checar `prefers-reduced-motion`. GSAP traria
  mais controle fino de easing/timeline, mas o resultado atual já cobre a especificação
  (seção 13 de `08-BLOCO-01-ABERTURA.md`) sem dependência extra — decisão revisitável no
  Gate 6 (Motion) de um bloco futuro, se for necessário algo mais elaborado.
- **Distribuição dos clusters da rede não é puramente aleatória.** Os centros dos clusters
  são posicionados ao longo de um eixo X que vai do centro da tela até a direita (com jitter
  aleatório), em vez de sorteados livremente em todo o volume — isso evita tanto uma "bola"
  densa única quanto clusters sorteados para fora da viewport. Ajustado visualmente por
  iteração durante esta implementação (ver seção "Limitações atuais").
- **Halos via `CanvasTexture` gerada em runtime**, não um arquivo de imagem — mantém o
  protótipo sem assets binários.
- **DPR limitado a 2** (`Math.min(devicePixelRatio, 2)`) e renderer com
  `powerPreference: "low-power"`, por performance.

## Como a rede 3D foi construída

1. Geração de `clusterCount` clusters (5 no desktop, 3 em telas ≤720px), com centro
   distribuído do centro da tela para a direita e nós dispersos ao redor de cada centro por
   uma aproximação gaussiana (Box-Muller), formando um núcleo mais denso e uma borda mais
   rala por cluster — evita "bolha" perfeitamente uniforme.
2. Alguns pontos soltos (`looseNodes`) espalhados por todo o volume, sem conexão — reforçam a
   leitura de "elementos ainda independentes".
3. Conexões: qualquer par de nós a menos de `connectDistance` recebe uma linha; ~28% dessas
   linhas usam `LineDashedMaterial` (traço parcial), simulando conexões "ainda se formando";
   o restante usa `LineBasicMaterial` sólida, com opacidade baixa (0.22) para não competir
   com o texto.
4. Halos: ~9% dos nós recebem um `Sprite` adicional com textura radial suave e blending
   aditivo, para o efeito de "leve halo" pedido no concept.
5. Motion: rotação automática muito lenta (`sin`/tempo, amplitude pequena) + parallax de
   câmera amortecido (`lerp`) ao mouse, nunca a rede "perseguindo" o cursor.

## Como a responsividade foi tratada

- **Desktop (>1024px):** assimetria plena — texto à esquerda com `max-width` em caracteres
  (`ch`), rede ocupando o centro-direita e podendo se estender além da borda direita.
- **Tablet (≤1024px):** mesma estrutura, com o gradiente de legibilidade (`scrim`) um pouco
  mais forte, já que a rede fica proporcionalmente mais próxima do texto.
- **Mobile (≤720px):** *não* é o desktop encolhido — o container da rede muda de posição via
  media query (`inset` + `height: 46vh`, ancorado ao topo), o conteúdo textual vai para a
  base da tela, o `scrim` inverte de direção (horizontal → vertical) e a contagem de nós é
  reduzida (`isNarrow` no JS: menos clusters, menos nós por cluster, menos pontos soltos,
  `connectDistance` menor) para manter a rede discreta em vez de pesada.
- **Telas baixas em paisagem mobile** (`max-height: 560px`): breakpoint adicional reduz ainda
  mais a faixa vertical da rede, para não empurrar o texto para fora da tela.

## Como o reduced motion foi tratado

- `window.matchMedia("(prefers-reduced-motion: reduce)")` é checado antes de iniciar a
  sequência de entrada: se ativo, o `<main>` recebe `data-motion="skip"` em vez de
  `"ready"`, e o CSS correspondente mostra todo o conteúdo já no estado final (sem
  `@keyframes`).
- Mudança de preferência em tempo real (`change` no `matchMedia`) também é escutada.
- Um bloco `@media (prefers-reduced-motion: reduce)` adicional no CSS força
  `opacity: 1 !important; transform: none !important; animation: none !important;` em todos
  os elementos de texto, como camada extra de garantia independente do JS.
- No JS da rede, `reduceMotion` desliga tanto a rotação automática (`autoRotate`) quanto o
  parallax de mouse (`mouseParallax`) — a rede fica presente e estável, só sem movimento.

## Como o fallback sem WebGL foi tratado

- `main.js` testa a criação de um contexto WebGL (`canvas.getContext('webgl')`) e a presença
  do objeto global `THREE` antes de montar qualquer coisa em Three.js.
- Se qualquer uma das duas checagens falhar, `document.body` recebe a classe `no-webgl`, a
  sequência de motion do texto ainda roda normalmente, e a função retorna sem inicializar o
  renderer.
- Em CSS, `body.no-webgl .hero` aplica um fundo estático (dois `radial-gradient` sutis mais o
  gradiente de base) que substitui visualmente a rede, e `body.no-webgl .hero__canvas-wrap` /
  `.hero__scrim` ficam ocultos (`display: none`).
- **Validação nesta rodada:** o caminho foi confirmado por leitura de código e por checagem
  em runtime de que a detecção de WebGL retorna `true` no ambiente normal (ver histórico
  desta sessão) — **não foi forçada uma falha real de WebGL no navegador** para observar o
  fallback ao vivo. Recomenda-se testar manualmente desabilitando WebGL no navegador (ex.:
  `chrome://flags` ou DevTools → Rendering → "Disable WebGL") antes de considerar este ponto
  100% validado visualmente.

## Limitações atuais

- Testado nesta sessão via um servidor HTTP local mínimo (Node) e o navegador embutido do
  Claude Code — não foi testado em múltiplos navegadores/engines reais (Firefox, Safari) nem
  em dispositivo físico.
- A calibração fina da rede (quantidade exata de nós, espalhamento, distância de conexão) foi
  ajustada visualmente uma vez nesta sessão para evitar tanto "bola densa" quanto clusters
  fora de quadro; pode se beneficiar de mais uma rodada de ajuste fino ao lado do concept
  aprovado, lado a lado.
- O fallback sem WebGL não foi exercitado ao vivo (ver seção acima).
- Nenhum teste automatizado (visual regression, lint) foi configurado — é um protótipo de
  revisão, não código de produção.
- A fonte tipográfica usada é a pilha padrão do sistema (`-apple-system, "Segoe UI",
  "Inter", "Helvetica Neue", Arial, sans-serif`) — nenhuma fonte específica foi decidida,
  conforme a seção 24 de `08-BLOCO-01-ABERTURA.md` ("decisões ainda abertas").
- Paleta de cores usa valores HEX de exemplo (near-black + accent azul/ciano), coerentes com
  a direção do concept, mas não formalmente "aprovados pixel a pixel" — também está entre as
  decisões abertas do documento 08.

## Próximos passos sugeridos

1. Revisar visualmente em navegador real (não só no preview desta sessão), em pelo menos
   desktop largo (~1440px) e um celular físico ou emulador confiável.
2. Testar o fallback sem WebGL de fato (desabilitando WebGL no navegador).
3. Decidir formalmente (fora deste protótipo) os pontos da seção 24 de
   `08-BLOCO-01-ABERTURA.md` que ainda influenciam a implementação: paleta final, fonte,
   duração/easing definitivos.
4. Só depois de aprovado, considerar o Bloco 02 — não iniciar antes.
