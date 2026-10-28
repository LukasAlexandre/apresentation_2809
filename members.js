/* Slide 07 — painel expandido dos integrantes.
   Conteúdo conferido com as PRs de residenciaweb3/credenciamento-de-icts-mvp5 em 28/10.
   status: "done" = já integrado ao projeto · "review" = em revisão / validação. */
(function () {
  "use strict";

  var MEMBERS = {
    lukas: {
      name: "Lukas",
      area: "Regras, riscos e etapas centrais do credenciamento",
      did: [
        { text: "Definiu as regras e a arquitetura do sistema", status: "done" },
        { text: "Mapeou os riscos e os cuidados de segurança", status: "done" },
        { text: "Construiu ativação, auditoria, renovação e consulta da situação", status: "done" }
      ],
      extra: { text: "Organização dos dados do sistema (T-013)", status: "review" },
      how: "Cada instituição passa por etapas definidas: é ativada, pode ser auditada e renovada. Cada mudança fica registrada, e qualquer pessoa pode consultar a situação atual.",
      why: "O processo ganha regras claras, deixa rastro de cada decisão e oferece uma informação confiável a quem consulta."
    },
    gabriel: {
      name: "Gabriel",
      area: "Entrada da instituição e início do credenciamento",
      did: [
        { text: "Registro oficial da instituição", status: "done" },
        { text: "Solicitação de credenciamento", status: "done" },
        { text: "Registro da decisão sobre a solicitação", status: "done" }
      ],
      how: "A instituição é registrada e ligada a uma conta própria. Depois, envia seu pedido, e o órgão responsável registra a decisão. Uma instituição só pode agir em nome dela mesma.",
      why: "Cria um caminho organizado e verificável, do registro da instituição até a decisão sobre o pedido."
    },
    alison: {
      name: "Alison",
      area: "Permissões, segurança e usuários",
      did: [
        { text: "Definiu quem pode realizar cada operação", status: "done" },
        { text: "Mapeou cuidados com as chaves de acesso", status: "done" },
        { text: "Estruturou a base de usuários", status: "review" }
      ],
      how: "Cada usuário tem um papel: instituição, órgão credenciador, auditor ou administrador. Cada papel só executa as ações permitidas a ele, e as senhas ficam guardadas de forma protegida.",
      why: "Evita acessos indevidos e deixa claro quem é responsável por cada ação."
    },
    kaique: {
      name: "Kaique",
      area: "Experiência web, pública e interna",
      did: [
        { text: "Página pública do projeto", status: "done" },
        { text: "Estrutura da área interna", status: "done" },
        { text: "Menu de navegação entre as telas", status: "done" }
      ],
      extra: { text: "Entrada e saída do sistema (login)", status: "review" },
      how: "A página pública apresenta o projeto. A área interna já tem a estrutura e o menu que vão receber as funções do sistema. O login está em revisão, e a conexão completa ainda será construída.",
      why: "Transforma o que foi construído em algo que as pessoas conseguem usar com facilidade."
    },
    heitor: {
      name: "Heitor",
      area: "Mentoria e revisão técnica",
      did: [
        { text: "Orientação sobre a arquitetura" },
        { text: "Revisão das implementações" },
        { text: "Validação e integração das entregas" }
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

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function item(entry) {
    var tag = entry.status
      ? '<span class="member-tag member-tag--' + entry.status + '">' + STATUS_LABEL[entry.status] + "</span>"
      : "";
    return "<li><span>" + esc(entry.text) + "</span>" + tag + "</li>";
  }

  function render(m) {
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
