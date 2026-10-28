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
  // Um único elemento dentro do <dialog> (fica na camada do modal), posicionado em
  // position: fixed junto ao box. Abre por hover, foco de teclado ou toque.
  var tip = document.createElement("div");
  tip.className = "member-tip";
  tip.id = "member-tip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  modal.appendChild(tip);
  var tipTarget = null;
  var lastPointer = "mouse";

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
    tip.classList.remove("is-visible");

    // Acima do box; se não couber, abaixo. Sempre dentro da tela (margem de 8px).
    var r = li.getBoundingClientRect();
    var w = tip.offsetWidth;
    var h = tip.offsetHeight;
    var gap = 10;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var left = r.left;
    var top = r.top - h - gap;
    if (top < 8) top = r.bottom + gap;
    if (top + h > vh - 8) {
      // Tela baixa: ao lado do box, se houver espaço; senão, o mais perto possível.
      top = Math.min(Math.max(8, r.top), vh - h - 8);
      if (r.right + gap + w <= vw - 8) left = r.right + gap;
      else if (r.left - gap - w >= 8) left = r.left - gap - w;
    }
    left = Math.max(8, Math.min(left, vw - w - 8));
    tip.style.top = Math.max(8, top) + "px";
    tip.style.left = left + "px";
    void tip.offsetWidth; // reinicia a transição de entrada
    tip.classList.add("is-visible");
  }

  function hideTip() {
    if (tipTarget) tipTarget.removeAttribute("aria-describedby");
    tipTarget = null;
    tip.classList.remove("is-visible");
    tip.hidden = true;
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
  panel.addEventListener("scroll", hideTip, { passive: true });
  window.addEventListener("resize", hideTip, { passive: true });

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
