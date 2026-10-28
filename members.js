/* Slide 07 — painel expandido dos integrantes.
   Conteúdo conferido com issues, PRs e ADRs de residenciaweb3/credenciamento-de-icts-mvp5 em 28/10.
   status: "done" = já integrado ao projeto · "review" = em revisão / validação.
   tip: legenda exibida ao passar o mouse, focar ou tocar no box (id · título · descrição · referência). */
(function () {
  "use strict";

  var MEMBERS = {
    lukas: {
      name: "Lukas",
      area: "Regras, riscos e etapas centrais do credenciamento",
      did: [
        {
          text: "Definiu as regras e a arquitetura do sistema", status: "done",
          tip: {
            id: "ADR-001 · T-002", title: "Arquitetura do credenciamento",
            desc: "Definiu como o credenciamento funciona: as etapas, quem pode fazer cada ação e a separação entre o que fica público na blockchain e o que fica protegido fora dela.",
            ref: "Issue #2 · PR #5 · docs/adr/ADR-001"
          }
        },
        {
          text: "Mapeou os riscos e os cuidados de segurança", status: "done",
          tip: {
            id: "T-003", title: "Modelo de ameaças",
            desc: "Listou riscos reais, como roubo de chaves de acesso, envio de informação falsa e exposição de dados, e registrou como cada um é evitado ou reduzido.",
            ref: "Issue #3 · PR #6 · docs/modelo-de-ameacas.md"
          }
        },
        {
          text: "Construiu ativação, auditoria, renovação e consulta da situação", status: "done",
          tip: {
            id: "T-008 · T-009 · T-010", title: "Etapas centrais do credenciamento",
            desc: "Programou a ativação do credenciamento, a auditoria, a renovação que mantém o histórico encadeado e a consulta pública da situação atual de cada instituição.",
            ref: "Issues #12, #13, #14 · PRs #23, #24, #25"
          }
        }
      ],
      extra: { text: "Organização dos dados do sistema (T-013 · PR #44)", status: "review" },
      how: "Cada instituição passa por etapas definidas: é ativada, pode ser auditada e renovada. Cada mudança fica registrada, e qualquer pessoa pode consultar a situação atual.",
      why: "O processo ganha regras claras, deixa rastro de cada decisão e oferece uma informação confiável a quem consulta."
    },
    gabriel: {
      name: "Gabriel",
      area: "Entrada da instituição e início do credenciamento",
      did: [
        {
          text: "Registro oficial da instituição", status: "done",
          tip: {
            id: "T-006", title: "Registro da instituição",
            desc: "Criou o registro oficial da instituição e a ligou a uma única conta, para que ninguém consiga agir em nome de outra instituição.",
            ref: "Issue #10 · PR #21"
          }
        },
        {
          text: "Solicitação de credenciamento", status: "done",
          tip: {
            id: "T-007", title: "Pedido de credenciamento",
            desc: "Permitiu que uma instituição já registrada envie seu pedido. Na blockchain fica só uma “impressão digital” dos documentos, nunca o conteúdo deles.",
            ref: "Issue #11 · PR #22"
          }
        },
        {
          text: "Registro da decisão sobre a solicitação", status: "done",
          tip: {
            id: "T-007", title: "Decisão sobre o pedido",
            desc: "O órgão credenciador registra a decisão sobre cada pedido. Ela entra no histórico permanente e pode ser verificada depois.",
            ref: "Issue #11 · PR #22"
          }
        }
      ],
      how: "A instituição é registrada e ligada a uma conta própria. Depois, envia seu pedido, e o órgão responsável registra a decisão. Uma instituição só pode agir em nome dela mesma.",
      why: "Cria um caminho organizado e verificável, do registro da instituição até a decisão sobre o pedido."
    },
    alison: {
      name: "Alison",
      area: "Permissões, segurança e usuários",
      did: [
        {
          text: "Definiu quem pode realizar cada operação", status: "done",
          tip: {
            id: "ADR-002 · T-005", title: "Papéis e permissões",
            desc: "Definiu os quatro papéis do sistema (administrador, órgão credenciador, instituição e auditor) e quais operações cada um pode assinar.",
            ref: "Issue #9 · PR #20 · docs/adr/ADR-002"
          }
        },
        {
          text: "Mapeou cuidados com as chaves de acesso", status: "done",
          tip: {
            id: "ADR-002 · T-003", title: "Proteção das chaves de acesso",
            desc: "Decidiu onde ficam guardadas as chaves que assinam as operações e separou a conta de administração das contas do dia a dia, reduzindo o risco de uso indevido.",
            ref: "Issue #9 · PR #20 · co-responsável pela issue #3"
          }
        },
        {
          text: "Estruturou a base de usuários", status: "done",
          tip: {
            id: "T-011", title: "Base de usuários",
            desc: "Criou o cadastro de usuários com o papel de cada pessoa, senhas guardadas de forma protegida e usuários de teste para cada papel.",
            ref: "Issue #15 · ajustes posteriores nas PRs #40 e #41"
          }
        }
      ],
      how: "Cada usuário tem um papel: instituição, órgão credenciador, auditor ou administrador. Cada papel só executa as ações permitidas a ele, e as senhas ficam guardadas de forma protegida.",
      why: "Evita acessos indevidos e deixa claro quem é responsável por cada ação."
    },
    kaique: {
      name: "Kaique",
      area: "Experiência web, pública e interna",
      did: [
        {
          text: "Página pública do projeto", status: "done",
          tip: {
            id: "T-004", title: "Página pública",
            desc: "Construiu a página que apresenta o projeto ao público e explica para que serve o credenciamento.",
            ref: "Issue #4 · PR #7"
          }
        },
        {
          text: "Estrutura da área interna", status: "done",
          tip: {
            id: "T-014", title: "Área interna",
            desc: "Montou a estrutura das telas internas, com espaços já reservados para Solicitações, Habilitações e Auditorias.",
            ref: "Issue #18 · PR #26"
          }
        },
        {
          text: "Menu de navegação entre as telas", status: "done",
          tip: {
            id: "T-014", title: "Menu de navegação",
            desc: "Criou o menu lateral, que vira abas no celular e pode ser usado inteiramente pelo teclado.",
            ref: "Issue #18 · PR #26"
          }
        }
      ],
      extra: { text: "Entrada e saída do sistema, login (T-015 · PR #46)", status: "review" },
      how: "A página pública apresenta o projeto. A área interna já tem a estrutura e o menu que vão receber as funções do sistema. O login está em revisão, e a conexão completa ainda será construída.",
      why: "Transforma o que foi construído em algo que as pessoas conseguem usar com facilidade."
    },
    heitor: {
      name: "Heitor",
      area: "Mentoria e revisão técnica",
      did: [
        {
          text: "Orientação sobre a arquitetura",
          tip: {
            id: "Mentoria", title: "Orientação técnica",
            desc: "Orienta as decisões técnicas do time, como a estratégia de entregar em sequência as tarefas que dependem umas das outras.",
            ref: "Exemplo registrado na PR #22"
          }
        },
        {
          text: "Revisão das implementações",
          tip: {
            id: "Revisões", title: "Revisão das entregas",
            desc: "Revisa cada entrega antes de ela entrar no projeto e pede os ajustes necessários.",
            ref: "Revisões nas PRs #6, #20, #21, #22, #23, #24, #25, #41, #43"
          }
        },
        {
          text: "Validação e integração das entregas",
          tip: {
            id: "Integração", title: "Validação e integração",
            desc: "Aprova as entregas validadas e as incorpora à versão principal do projeto.",
            ref: "Integrou as PRs #23, #24, #25, #43, #45"
          }
        }
      ],
      how: "Acompanha a evolução do projeto, revisa cada entrega antes de ela entrar no sistema e orienta os ajustes necessários.",
      why: "Ajuda a garantir que tudo siga os requisitos e os padrões definidos para o projeto."
    }
  };

  var STATUS_LABEL = { done: "Integrado", review: "Em revisão" };

  var modal = document.getElementById("member-modal");
  var body = document.getElementById("member-modal-body");
  var panel = modal && modal.querySelector(".member-modal__panel");
  var cards = document.querySelectorAll("[data-member]");
  if (!modal || !body || typeof modal.showModal !== "function") return;

  var lastCard = null;
  var current = null;

  // ---------- Legenda (tooltip) dos boxes "O que fez na prática" ----------
  // Fica FORA do painel do modal, de preferência à esquerda, alinhada ao box e ligada a ele
  // por uma linha com seta (SVG). Os elementos ficam dentro do <dialog> e não no body: o
  // modal aberto ocupa a camada superior (top layer), e nada fora dele aparece por cima.
  // Abre por hover, foco de teclado ou toque.
  var SVG_NS = "http://www.w3.org/2000/svg";
  var tip = document.createElement("div");
  tip.className = "member-tip";
  tip.id = "member-tip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  modal.appendChild(tip);

  var link = document.createElementNS(SVG_NS, "svg");
  link.setAttribute("class", "member-tip-link");
  link.setAttribute("aria-hidden", "true");
  link.innerHTML =
    '<defs><marker id="member-tip-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
    '<path d="M0 0 L10 5 L0 10 z"></path></marker></defs>' +
    '<circle r="3"></circle><line marker-end="url(#member-tip-arrow)"></line>';
  link.style.display = "none";
  modal.appendChild(link);
  var linkLine = link.querySelector("line");
  var linkDot = link.querySelector("circle");

  var tipTarget = null;
  var lastPointer = "mouse";

  var EDGE = 8; // distância mínima da borda da tela
  var GAP = 28; // espaço entre a legenda e o painel (onde corre a linha)
  var MAX_W = 320;
  var MIN_W = 176;

  function position() {
    if (!tipTarget) return;
    var r = tipTarget.getBoundingClientRect();
    var p = panel.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var spaceLeft = p.left - EDGE - GAP;
    var spaceRight = vw - p.right - EDGE - GAP;
    var side = spaceLeft >= spaceRight ? "left" : "right";
    var space = Math.max(spaceLeft, spaceRight);
    var cy = r.top + r.height / 2;
    var x1, y1, x2, y2, w, h, left, top;

    if (space >= MIN_W) {
      // Fora do modal, alinhada verticalmente ao centro do box.
      w = Math.min(MAX_W, space);
      tip.style.width = w + "px";
      tip.classList.toggle("member-tip--narrow", w < 240);
      h = tip.offsetHeight;
      left = side === "left" ? p.left - GAP - w : p.right + GAP;
      top = Math.max(EDGE, Math.min(cy - h / 2, vh - h - EDGE));
      x1 = side === "left" ? left + w : left;
      y1 = Math.max(top + 14, Math.min(cy, top + h - 14));
      x2 = side === "left" ? r.left - 3 : r.right + 3;
      y2 = cy;
    } else {
      // Tela estreita (celular): sem espaço fora do modal. Acima do box (ou abaixo), seta vertical.
      w = Math.min(MAX_W, vw - 2 * EDGE);
      tip.style.width = w + "px";
      tip.classList.remove("member-tip--narrow");
      h = tip.offsetHeight;
      left = Math.max(EDGE, Math.min(r.left, vw - w - EDGE));
      var above = r.top - h - 22 >= EDGE;
      top = above ? r.top - h - 22 : Math.min(r.bottom + 22, vh - h - EDGE);
      x1 = x2 = Math.max(left + 20, Math.min(r.left + 28, left + w - 20));
      y1 = above ? top + h : top;
      y2 = above ? r.top - 3 : r.bottom + 3;
    }

    tip.style.left = Math.round(left) + "px";
    tip.style.top = Math.round(top) + "px";
    link.setAttribute("viewBox", "0 0 " + vw + " " + vh);
    linkLine.setAttribute("x1", x1);
    linkLine.setAttribute("y1", y1);
    linkLine.setAttribute("x2", x2);
    linkLine.setAttribute("y2", y2);
    linkDot.setAttribute("cx", x1);
    linkDot.setAttribute("cy", y1);
  }

  function showTip(li) {
    var entry = current && current.did[Number(li.getAttribute("data-tip"))];
    if (!entry || !entry.tip) return;
    var t = entry.tip;
    tip.innerHTML =
      '<p class="member-tip__id">' + esc(t.id) + "</p>" +
      '<p class="member-tip__title">' + esc(t.title) + "</p>" +
      '<p class="member-tip__desc">' + esc(t.desc) + "</p>" +
      (t.ref ? '<p class="member-tip__ref">Referência: ' + esc(t.ref) + "</p>" : "");
    if (tipTarget && tipTarget !== li) tipTarget.removeAttribute("aria-describedby");
    tipTarget = li;
    li.setAttribute("aria-describedby", "member-tip");
    tip.hidden = false;
    link.style.display = "";
    tip.classList.remove("is-visible");
    link.classList.remove("is-visible");
    position();
    void tip.offsetWidth; // reinicia a transição de entrada
    tip.classList.add("is-visible");
    link.classList.add("is-visible");
    queueReposition(); // confirma a posição no próximo quadro, com o layout já assentado
  }

  function hideTip() {
    if (tipTarget) tipTarget.removeAttribute("aria-describedby");
    tipTarget = null;
    tip.classList.remove("is-visible");
    link.classList.remove("is-visible");
    tip.hidden = true;
    link.style.display = "none";
  }

  // Resize, zoom ou rolagem do painel: recalcula a posição em vez de esconder.
  var repositionQueued = false;
  function queueReposition() {
    if (!tipTarget || repositionQueued) return;
    repositionQueued = true;
    requestAnimationFrame(function () {
      repositionQueued = false;
      position();
    });
  }

  function tipBox(event) {
    return event.target.closest && event.target.closest("li[data-tip]");
  }

  body.addEventListener("pointerdown", function (event) {
    lastPointer = event.pointerType || "mouse";
  });
  document.addEventListener("keydown", function () {
    lastPointer = "keyboard";
  }, true);
  body.addEventListener("mouseover", function (event) {
    var li = tipBox(event);
    if (li && li !== tipTarget && lastPointer !== "touch") showTip(li);
  });
  body.addEventListener("mouseout", function (event) {
    var li = tipBox(event);
    if (li && li === tipTarget && !li.contains(event.relatedTarget) && lastPointer !== "touch") hideTip();
  });
  body.addEventListener("focusin", function (event) {
    var li = tipBox(event);
    if (li && lastPointer !== "touch") showTip(li);
  });
  body.addEventListener("focusout", function (event) {
    if (tipBox(event) === tipTarget) hideTip();
  });
  // Toque: um toque abre a legenda; tocar de novo no mesmo box ou fora dele fecha.
  body.addEventListener("click", function (event) {
    var li = tipBox(event);
    if (lastPointer !== "touch") return;
    if (li && li !== tipTarget) showTip(li);
    else hideTip();
  });
  panel.addEventListener("scroll", queueReposition, { passive: true });
  window.addEventListener("resize", queueReposition, { passive: true });
  // Fim da animação de abertura do modal e carregamento das fontes também movem o box.
  modal.addEventListener("animationend", queueReposition);
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", queueReposition);

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function item(entry, i) {
    var tag = entry.status
      ? '<span class="member-tag member-tag--' + entry.status + '">' + STATUS_LABEL[entry.status] + "</span>"
      : "";
    var attrs = entry.tip ? ' tabindex="0" data-tip="' + i + '"' : "";
    return "<li" + attrs + "><span>" + esc(entry.text) + "</span>" + tag + "</li>";
  }

  function render(m) {
    current = m;
    hideTip();
    var extra = m.extra
      ? '<p class="member-modal__extra">Em andamento: ' + esc(m.extra.text) +
        ' <span class="member-tag member-tag--' + m.extra.status + '">' + STATUS_LABEL[m.extra.status] + "</span></p>"
      : "";
    body.innerHTML =
      '<p class="member-modal__eyebrow">Quem está construindo</p>' +
      '<h2 class="member-modal__name" id="member-modal-name">' + esc(m.name) + "</h2>" +
      '<p class="member-modal__area">' + esc(m.area) + "</p>" +
      '<div class="member-modal__grid">' +
      '<section class="member-modal__col"><h3 class="member-modal__label">O que fez na prática</h3>' +
      '<ol class="member-modal__list">' + m.did.map(item).join("") + "</ol>" + extra + "</section>" +
      '<section class="member-modal__col">' +
      '<h3 class="member-modal__label">Como isso funciona</h3><p class="member-modal__text">' + esc(m.how) + "</p>" +
      '<h3 class="member-modal__label">Por que isso é importante</h3><p class="member-modal__text member-modal__text--why">' + esc(m.why) + "</p>" +
      "</section></div>";
  }

  function clearSelected() {
    cards.forEach(function (c) {
      c.classList.remove("is-selected");
    });
  }

  function open(card) {
    var m = MEMBERS[card.getAttribute("data-member")];
    if (!m) return;
    if (modal.open) modal.close(); // nunca dois abertos ao mesmo tempo
    clearSelected();
    lastCard = card;
    render(m);
    card.classList.add("is-selected");
    document.documentElement.classList.add("member-open");
    modal.showModal();
    // Foco no painel (não no botão): Espaço/passador de slides não fecha o painel por acidente.
    panel.focus({ preventScroll: true });
  }

  // Limpeza feita direto em cada caminho de fechamento (o evento "close" do <dialog> é
  // assíncrono e pode atrasar com a aba em segundo plano). Idempotente.
  function cleanup() {
    if (modal.open) return;
    hideTip();
    document.documentElement.classList.remove("member-open");
    clearSelected();
    if (lastCard) lastCard.focus({ preventScroll: true });
    lastCard = null;
  }

  function close() {
    if (modal.open) modal.close();
    cleanup();
  }

  modal.addEventListener("close", cleanup);
  modal.addEventListener("cancel", function (event) {
    event.preventDefault();
    close();
  });

  modal.querySelector(".member-modal__close").addEventListener("click", close);

  // Clique fora do painel (no fundo escurecido) fecha.
  modal.addEventListener("click", function (event) {
    if (event.target === modal) close();
  });

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      open(card);
    });
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        event.stopPropagation(); // não deixa o Espaço avançar o slide
        open(card);
      }
    });
  });

  // Com o painel aberto, as teclas de navegação do deck (main.js) não podem trocar de slide.
  var NAV_KEYS = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Spacebar", "Home", "End"];
  window.addEventListener(
    "keydown",
    function (event) {
      if (!modal.open) return;
      if (event.key === "Escape" || event.key === "Esc") {
        event.preventDefault();
        close();
      } else if (NAV_KEYS.indexOf(event.key) !== -1) {
        event.stopPropagation();
      }
    },
    true
  );
})();
