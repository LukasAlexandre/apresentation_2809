/**
 * Bloco 01 — Abertura — rede 3D decorativa + sequência de entrada.
 * Fonte de verdade: docs/apresentacao/08-BLOCO-01-ABERTURA.md e 09-CONCEPT-BLOCO-01.md
 *
 * Este script só cuida de decoração (canvas) e da sequência de motion do hero.
 * Nenhum conteúdo textual é gerado aqui — o texto já existe no HTML.
 */
(function () {
  "use strict";

  var heroEl = document.getElementById("hero");
  var canvasWrap = document.getElementById("canvas-wrap");
  var canvas = document.getElementById("network-canvas");
  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function prefersReducedMotion() {
    return reducedMotionQuery.matches;
  }

  // ---------- Sequência de entrada do texto (CSS-driven) ----------
  // data-motion="ready"  -> anima em sequência (ver styles.css)
  // data-motion="skip"   -> conteúdo aparece direto, sem stagger (reduced motion / sem JS relevante)
  function startTextMotion() {
    if (prefersReducedMotion()) {
      heroEl.setAttribute("data-motion", "skip");
    } else {
      heroEl.setAttribute("data-motion", "ready");
    }
  }

  reducedMotionQuery.addEventListener
    ? reducedMotionQuery.addEventListener("change", function () {
        if (prefersReducedMotion()) heroEl.setAttribute("data-motion", "skip");
      })
    : null;

  // ---------- Detecção de WebGL / three.js ----------
  function webglAvailable() {
    try {
      var testCanvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  }

  var canUseNetwork = webglAvailable() && typeof window.THREE !== "undefined";

  if (!canUseNetwork) {
    // Fallback: composição estática só em CSS (ver body.no-webgl em styles.css).
    document.body.classList.add("no-webgl");
    startTextMotion();
    return;
  }

  // ---------- Configuração da rede ----------
  var isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  var isNarrow = window.innerWidth <= 720;
  var reduceMotion = prefersReducedMotion();

  var CONFIG = {
    clusterCount: isNarrow ? 3 : 5,
    nodesPerCluster: isNarrow ? 7 : 11,
    looseNodes: isNarrow ? 5 : 10,
    haloNodeRatio: 0.09, // fração dos nós que ganham halo suave
    connectDistance: isNarrow ? 1.5 : 1.65,
    partialLineRatio: 0.28, // fração das conexões desenhadas como "ainda se formando" (dashed)
    clusterSpread: [0.7, 1.15], // abertura de cada cluster (min/max) — lattice aberto, não bola densa
    // Faixa em X onde os CENTROS dos clusters ficam distribuídos, do centro da tela para a
    // direita (o grupo em si permanece com deslocamento adicional, ver networkGroup.position.x).
    clusterCenterRangeX: isNarrow ? [-1.6, 1.6] : [-0.5, 6.5],
    volume: {
      x: [isNarrow ? -3.2 : -1.8, isNarrow ? 3.2 : 8.5],
      y: [-3.6, 3.6],
      z: [-3.2, 2.4],
    },
    accentColor: 0x7dd3fc,
    haloColor: 0x9fe4ff,
    lineColor: 0x4fa9d6,
    nodeColor: 0xbfe3f5,
    autoRotate: !reduceMotion,
    mouseParallax: !reduceMotion && !isCoarsePointer,
  };

  var THREE = window.THREE;

  var renderer, scene, camera;
  var networkGroup, pointsMesh, lineSegments, dashedSegments, haloGroup;
  var raf = null;
  var visible = true;
  var pointerTarget = { x: 0, y: 0 };
  var pointerCurrent = { x: 0, y: 0 };
  var clock = new THREE.Clock();

  function init() {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvasWrap.clientWidth, canvasWrap.clientHeight, false);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      45,
      canvasWrap.clientWidth / canvasWrap.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 9);

    networkGroup = new THREE.Group();
    scene.add(networkGroup);

    buildNetwork();

    window.addEventListener("resize", onResize, { passive: true });
    if (CONFIG.mouseParallax) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    observeViewport();
    onResize();
    startRenderLoop();
  }

  // ---------- Construção da rede: clusters + conexões + halos ----------
  function buildNetwork() {
    var nodes = [];
    var vol = CONFIG.volume;

    function rand(min, max) {
      return min + Math.random() * (max - min);
    }

    // Clusters discretos, distribuídos do centro da tela para a direita (não posições
    // totalmente aleatórias, para evitar que fiquem todos fora de quadro ou amontoados).
    var cxRange = CONFIG.clusterCenterRangeX;
    for (var c = 0; c < CONFIG.clusterCount; c++) {
      var t = CONFIG.clusterCount > 1 ? c / (CONFIG.clusterCount - 1) : 0.5;
      var cx = cxRange[0] + t * (cxRange[1] - cxRange[0]) + rand(-0.5, 0.5);
      var cy = rand(vol.y[0] + 0.8, vol.y[1] - 0.8);
      var cz = rand(vol.z[0] + 0.5, vol.z[1] - 0.5);
      var spread = rand(CONFIG.clusterSpread[0], CONFIG.clusterSpread[1]);

      for (var n = 0; n < CONFIG.nodesPerCluster; n++) {
        nodes.push(
          new THREE.Vector3(
            cx + gaussian() * spread,
            cy + gaussian() * spread,
            cz + gaussian() * spread * 0.7
          )
        );
      }
    }

    // Pontos soltos, fora da estrutura principal — reforça "elementos ainda independentes".
    for (var l = 0; l < CONFIG.looseNodes; l++) {
      nodes.push(
        new THREE.Vector3(rand(vol.x[0], vol.x[1]), rand(vol.y[0], vol.y[1]), rand(vol.z[0], vol.z[1]))
      );
    }

    // ---- Pontos (nós) ----
    var pointsGeo = new THREE.BufferGeometry().setFromPoints(nodes);
    var pointsMat = new THREE.PointsMaterial({
      color: CONFIG.nodeColor,
      size: isNarrow ? 0.05 : 0.045,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });
    pointsMesh = new THREE.Points(pointsGeo, pointsMat);
    networkGroup.add(pointsMesh);

    // ---- Conexões entre nós próximos (dentro do mesmo cluster, na prática) ----
    var solidVerts = [];
    var dashedVerts = [];
    var maxDist = CONFIG.connectDistance;

    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var d = nodes[i].distanceTo(nodes[j]);
        if (d < maxDist) {
          var target = Math.random() < CONFIG.partialLineRatio ? dashedVerts : solidVerts;
          target.push(nodes[i].x, nodes[i].y, nodes[i].z);
          target.push(nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }

    if (solidVerts.length) {
      var solidGeo = new THREE.BufferGeometry();
      solidGeo.setAttribute("position", new THREE.Float32BufferAttribute(solidVerts, 3));
      var solidMat = new THREE.LineBasicMaterial({
        color: CONFIG.lineColor,
        transparent: true,
        opacity: 0.22,
      });
      lineSegments = new THREE.LineSegments(solidGeo, solidMat);
      networkGroup.add(lineSegments);
    }

    if (dashedVerts.length) {
      var dashedGeo = new THREE.BufferGeometry();
      dashedGeo.setAttribute("position", new THREE.Float32BufferAttribute(dashedVerts, 3));
      var dashedMat = new THREE.LineDashedMaterial({
        color: CONFIG.lineColor,
        transparent: true,
        opacity: 0.16,
        dashSize: 0.22,
        gapSize: 0.28,
      });
      dashedSegments = new THREE.LineSegments(dashedGeo, dashedMat);
      dashedSegments.computeLineDistances();
      networkGroup.add(dashedSegments);
    }

    // ---- Halos suaves em alguns nós (sprites, sem asset externo) ----
    haloGroup = new THREE.Group();
    var haloTexture = makeHaloTexture();
    var haloCount = Math.round(nodes.length * CONFIG.haloNodeRatio);
    for (var h = 0; h < haloCount; h++) {
      var pick = nodes[Math.floor(Math.random() * nodes.length)];
      var spriteMat = new THREE.SpriteMaterial({
        map: haloTexture,
        color: CONFIG.haloColor,
        transparent: true,
        opacity: rand(0.25, 0.5),
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      var sprite = new THREE.Sprite(spriteMat);
      var scale = rand(0.35, 0.65);
      sprite.scale.set(scale, scale, 1);
      sprite.position.copy(pick);
      haloGroup.add(sprite);
    }
    networkGroup.add(haloGroup);

    // Leve ajuste fino além da distribuição de clusters (que já favorece centro-direita).
    networkGroup.position.x = isNarrow ? 0 : 0.4;
  }

  // Aproximação simples de distribuição gaussiana (Box-Muller), para clusters com núcleo denso
  // e borda mais rala — evita "bolha" perfeitamente uniforme.
  function gaussian() {
    var u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * 0.5;
  }

  function makeHaloTexture() {
    var size = 128;
    var c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    var ctx = c.getContext("2d");
    var gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.35)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  // ---------- Resize ----------
  function onResize() {
    var w = canvasWrap.clientWidth;
    var h = canvasWrap.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  // ---------- Parallax sutil do mouse ----------
  function onMouseMove(event) {
    var nx = event.clientX / window.innerWidth - 0.5; // -0.5..0.5
    var ny = event.clientY / window.innerHeight - 0.5;
    pointerTarget.x = nx;
    pointerTarget.y = ny;
  }

  // ---------- Pausa fora de viewport / aba oculta (performance) ----------
  function onVisibilityChange() {
    visible = !document.hidden;
    if (visible) startRenderLoop();
    else stopRenderLoop();
  }

  function observeViewport() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(
      function (entries) {
        var entry = entries[0];
        visible = entry.isIntersecting && !document.hidden;
        if (visible) startRenderLoop();
        else stopRenderLoop();
      },
      { threshold: 0.05 }
    );
    io.observe(heroEl);
  }

  // ---------- Loop de renderização ----------
  function startRenderLoop() {
    if (raf !== null) return;
    clock.start();
    tick();
  }

  function stopRenderLoop() {
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    var elapsed = clock.getElapsedTime();

    if (CONFIG.autoRotate) {
      // Rotação muito lenta — sensação de estabilidade, não de "objeto girando".
      networkGroup.rotation.y = Math.sin(elapsed * 0.05) * 0.06 + elapsed * 0.008;
      networkGroup.rotation.x = Math.sin(elapsed * 0.04) * 0.03;
    }

    if (CONFIG.mouseParallax) {
      pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.04;
      pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.04;
      camera.position.x = pointerCurrent.x * 0.6;
      camera.position.y = -pointerCurrent.y * 0.4;
      camera.lookAt(networkGroup.position.x * 0.3, 0, 0);
    }

    renderer.render(scene, camera);
  }

  // ---------- Boot ----------
  init();
  startTextMotion();
})();

/**
 * Navegação da apresentação completa (13 blocos): dots laterais, scroll-spy,
 * atalhos de teclado e reveal leve dos blocos 02–13 ao entrar na viewport.
 * Independente do bloco de rede 3D acima — roda mesmo se o Three.js falhar.
 */
(function () {
  "use strict";

  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-block]"));
  if (!sections.length) return;

  var dots = Array.prototype.slice.call(document.querySelectorAll(".dotnav__item"));
  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function sectionByIndex(index) {
    return sections.filter(function (s) {
      return Number(s.getAttribute("data-block")) === index;
    })[0];
  }

  function currentIndex() {
    var mid = window.scrollY + window.innerHeight / 2;
    var current = 1;
    sections.forEach(function (s) {
      if (s.offsetTop <= mid) {
        current = Number(s.getAttribute("data-block"));
      }
    });
    return current;
  }

  function setActiveDot(index) {
    dots.forEach(function (d) {
      d.classList.toggle("is-active", Number(d.getAttribute("data-target")) === index);
    });
  }

  // ---------- Scroll determinístico e rápido ----------
  // Debounce por CARIMBO DE TEMPO (Date.now()), não por flag booleana + setTimeout.
  // Um flag que só é liberado por um timer pode travar a navegação PARA SEMPRE numa
  // apresentação ao vivo se o navegador atrasar/pausar timers (aba em segundo plano,
  // troca de janela durante a projeção, throttling do SO) — o timer de liberação nunca
  // dispara e todo clique/tecla seguinte é ignorado silenciosamente. Comparar
  // Date.now() a cada chamada não tem esse risco: não existe estado que precise de um
  // timer para ser "destravado". O alvo é sempre recalculado e limitado a maxScroll(),
  // então mesmo o último bloco (13) alinha exatamente ao topo da viewport.
  var lastNavAt = 0;
  var NAV_COOLDOWN = 300; // ms — só para absorver tecla segurada/duplo clique, nunca trava

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  // Salto instantâneo, via window.scrollTo(x, y) — a forma de dois argumentos, suportada
  // universalmente e sempre síncrona. Deliberadamente NÃO usamos animação aqui (nem
  // scrollTo({behavior:"smooth"}), nem uma animação própria via requestAnimationFrame):
  // ambas dependem do navegador seguir processando frames/timers depois do clique, e
  // ambas podem travar a navegação por completo se a aba perder o foco/visibilidade no
  // meio da transição — o pior cenário possível durante uma apresentação ao vivo (troca
  // de janela, segundo monitor, notificação). Um salto instantâneo nunca fica "pela
  // metade": o bloco certo aparece assim que a tecla/clique acontece, sempre. A sensação
  // de movimento fica por conta do CSS de entrada de cada bloco (leve, ~300-500ms).
  function scrollToIndex(index) {
    var now = Date.now();
    if (now - lastNavAt < NAV_COOLDOWN) return; // ignora saltos duplicados (tecla segurada, cliques em sequência)
    lastNavAt = now;

    var clamped = Math.max(1, Math.min(sections.length, index));
    var target = sectionByIndex(clamped);
    if (!target) return;

    var targetY = Math.min(target.offsetTop, maxScroll());
    setActiveDot(clamped);
    window.scrollTo(0, targetY);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      scrollToIndex(Number(dot.getAttribute("data-target")));
    });
  });

  // ---------- Scroll-spy (dots ativos + reveal leve por bloco) ----------
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15 }
    );
    sections.forEach(function (s) {
      if (s.classList.contains("hero")) return; // Bloco 01 tem sua própria sequência de entrada.
      revealObserver.observe(s);
    });
  } else {
    sections.forEach(function (s) {
      s.classList.add("is-visible");
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      setActiveDot(currentIndex());
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  setActiveDot(currentIndex());

  // ---------- Navegação por teclado ----------
  var NEXT_KEYS = ["ArrowDown", "PageDown", " ", "Spacebar"];
  var PREV_KEYS = ["ArrowUp", "PageUp"];

  window.addEventListener("keydown", function (event) {
    // Nunca interceptar teclas quando o foco está em um campo editável (não há nenhum
    // nesta apresentação, mas é uma proteção barata e correta para o futuro).
    var tag = (document.activeElement && document.activeElement.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement.isContentEditable) {
      return;
    }

    if (NEXT_KEYS.indexOf(event.key) !== -1) {
      event.preventDefault();
      scrollToIndex(currentIndex() + 1);
    } else if (PREV_KEYS.indexOf(event.key) !== -1) {
      event.preventDefault();
      scrollToIndex(currentIndex() - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      scrollToIndex(1);
    } else if (event.key === "End") {
      event.preventDefault();
      scrollToIndex(sections.length);
    }
  });
})();
