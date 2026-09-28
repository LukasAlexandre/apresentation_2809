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
    // Densidade ~2.5x maior que a versão original — mais presença de rede sem virar ruído.
    clusterCount: isNarrow ? 4 : 8,
    nodesPerCluster: isNarrow ? 9 : 18,
    looseNodes: isNarrow ? 8 : 20,
    haloNodeRatio: 0.11, // fração dos nós que ganham halo suave
    connectDistance: isNarrow ? 1.6 : 1.85,
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
    // "Vida" das partículas: deslocamento contínuo em x/y (leve z), por cluster + por nó.
    // Amplitudes pequenas de propósito — sensação de reorganização suave, não caos.
    liveMotion: !reduceMotion,
    clusterDriftAmp: [0.22, 0.4],
    clusterDriftFreq: [0.06, 0.14],
    nodeJitterAmp: [0.06, 0.16],
    nodeJitterFreq: [0.18, 0.42],
  };

  var THREE = window.THREE;

  var renderer, scene, camera;
  var networkGroup, pointsMesh, lineSegments, dashedSegments, haloGroup;
  var raf = null;
  var visible = true;
  var pointerTarget = { x: 0, y: 0 };
  var pointerCurrent = { x: 0, y: 0 };
  var clock = new THREE.Clock();

  // Estado do motion "vivo" — preenchido em buildNetwork(), consumido em updateLiveMotion().
  var nodeBase = []; // THREE.Vector3[] — posição de repouso de cada nó
  var nodeClusterIndex = []; // int[] — a qual cluster cada nó pertence (-1 = solto)
  var nodePhase = []; // { ax, ay, az, fx, fy, fz, px, py, pz }[] — jitter individual
  var clusterPhase = []; // { ax, ay, fx, fy, px, py }[] — drift compartilhado do cluster
  var livePositions = null; // Float32Array plana (x,y,z por nó), recalculada a cada frame
  var solidPairs = []; // [i, j, ...] índices de nós conectados por linha sólida
  var dashedPairs = []; // [i, j, ...] índices de nós conectados por linha tracejada
  var solidPosAttr = null;
  var dashedPosAttr = null;
  var haloNodeIndex = []; // índice do nó que cada sprite de halo acompanha

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

      // Fase de drift compartilhada por todo o cluster — dá "autonomia" ao grupo:
      // os nós de um mesmo cluster oscilam juntos, clusters diferentes dessincronizados.
      clusterPhase[c] = {
        ax: rand(CONFIG.clusterDriftAmp[0], CONFIG.clusterDriftAmp[1]),
        ay: rand(CONFIG.clusterDriftAmp[0], CONFIG.clusterDriftAmp[1]),
        fx: rand(CONFIG.clusterDriftFreq[0], CONFIG.clusterDriftFreq[1]),
        fy: rand(CONFIG.clusterDriftFreq[0], CONFIG.clusterDriftFreq[1]),
        px: rand(0, Math.PI * 2),
        py: rand(0, Math.PI * 2),
      };

      for (var n = 0; n < CONFIG.nodesPerCluster; n++) {
        nodes.push(
          new THREE.Vector3(
            cx + gaussian() * spread,
            cy + gaussian() * spread,
            cz + gaussian() * spread * 0.7
          )
        );
        nodeClusterIndex.push(c);
      }
    }

    // Pontos soltos, fora da estrutura principal — reforça "elementos ainda independentes".
    for (var l = 0; l < CONFIG.looseNodes; l++) {
      nodes.push(
        new THREE.Vector3(rand(vol.x[0], vol.x[1]), rand(vol.y[0], vol.y[1]), rand(vol.z[0], vol.z[1]))
      );
      nodeClusterIndex.push(-1);
    }

    nodeBase = nodes;

    // Jitter individual por nó — pequena amplitude, frequência levemente diferente entre
    // nós vizinhos para parecer "vivo" em vez de sincronizado (evita efeito "respiração única").
    for (var p = 0; p < nodes.length; p++) {
      nodePhase.push({
        ax: rand(CONFIG.nodeJitterAmp[0], CONFIG.nodeJitterAmp[1]),
        ay: rand(CONFIG.nodeJitterAmp[0], CONFIG.nodeJitterAmp[1]),
        az: rand(CONFIG.nodeJitterAmp[0], CONFIG.nodeJitterAmp[1]) * 0.6,
        fx: rand(CONFIG.nodeJitterFreq[0], CONFIG.nodeJitterFreq[1]),
        fy: rand(CONFIG.nodeJitterFreq[0], CONFIG.nodeJitterFreq[1]),
        fz: rand(CONFIG.nodeJitterFreq[0], CONFIG.nodeJitterFreq[1]),
        px: rand(0, Math.PI * 2),
        py: rand(0, Math.PI * 2),
        pz: rand(0, Math.PI * 2),
      });
    }

    livePositions = new Float32Array(nodes.length * 3);
    for (var b = 0; b < nodes.length; b++) {
      livePositions[b * 3] = nodes[b].x;
      livePositions[b * 3 + 1] = nodes[b].y;
      livePositions[b * 3 + 2] = nodes[b].z;
    }

    // ---- Pontos (nós) ----
    var pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(livePositions, 3));
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
    // Topologia calculada uma única vez (a partir da posição de repouso); a cada frame só
    // as posições das pontas são atualizadas, o que mantém o custo por frame em O(conexões).
    var maxDist = CONFIG.connectDistance;

    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var d = nodes[i].distanceTo(nodes[j]);
        if (d < maxDist) {
          var target = Math.random() < CONFIG.partialLineRatio ? dashedPairs : solidPairs;
          target.push(i, j);
        }
      }
    }

    if (solidPairs.length) {
      solidPosAttr = new THREE.BufferAttribute(new Float32Array(solidPairs.length * 3), 3);
      var solidGeo = new THREE.BufferGeometry();
      solidGeo.setAttribute("position", solidPosAttr);
      var solidMat = new THREE.LineBasicMaterial({
        color: CONFIG.lineColor,
        transparent: true,
        opacity: 0.25,
      });
      lineSegments = new THREE.LineSegments(solidGeo, solidMat);
      networkGroup.add(lineSegments);
    }

    if (dashedPairs.length) {
      dashedPosAttr = new THREE.BufferAttribute(new Float32Array(dashedPairs.length * 3), 3);
      var dashedGeo = new THREE.BufferGeometry();
      dashedGeo.setAttribute("position", dashedPosAttr);
      var dashedMat = new THREE.LineDashedMaterial({
        color: CONFIG.lineColor,
        transparent: true,
        opacity: 0.18,
        dashSize: 0.22,
        gapSize: 0.28,
      });
      dashedSegments = new THREE.LineSegments(dashedGeo, dashedMat);
      networkGroup.add(dashedSegments);
    }

    syncLinePositions(); // primeira escrita, com as posições de repouso

    // ---- Halos suaves em alguns nós (sprites, sem asset externo) ----
    haloGroup = new THREE.Group();
    var haloTexture = makeHaloTexture();
    var haloCount = Math.round(nodes.length * CONFIG.haloNodeRatio);
    for (var h = 0; h < haloCount; h++) {
      var pickIndex = Math.floor(Math.random() * nodes.length);
      var pick = nodes[pickIndex];
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
      haloNodeIndex.push(pickIndex);
    }
    networkGroup.add(haloGroup);

    // Leve ajuste fino além da distribuição de clusters (que já favorece centro-direita).
    networkGroup.position.x = isNarrow ? 0 : 0.4;
  }

  // Escreve em `livePositions` a posição de cada nó neste instante (repouso + drift do
  // cluster + jitter individual) e propaga para pontos, linhas e halos.
  function updateLiveMotion(elapsed) {
    var n;
    for (n = 0; n < nodeBase.length; n++) {
      var base = nodeBase[n];
      var jp = nodePhase[n];
      var ox = jp.ax * Math.sin(elapsed * jp.fx + jp.px);
      var oy = jp.ay * Math.sin(elapsed * jp.fy + jp.py);
      var oz = jp.az * Math.sin(elapsed * jp.fz + jp.pz);

      var ci = nodeClusterIndex[n];
      if (ci >= 0) {
        var cp = clusterPhase[ci];
        ox += cp.ax * Math.sin(elapsed * cp.fx + cp.px);
        oy += cp.ay * Math.sin(elapsed * cp.fy + cp.py);
      }

      livePositions[n * 3] = base.x + ox;
      livePositions[n * 3 + 1] = base.y + oy;
      livePositions[n * 3 + 2] = base.z + oz;
    }
    pointsMesh.geometry.attributes.position.needsUpdate = true;

    syncLinePositions();

    for (var h = 0; h < haloGroup.children.length; h++) {
      var ni = haloNodeIndex[h];
      haloGroup.children[h].position.set(
        livePositions[ni * 3],
        livePositions[ni * 3 + 1],
        livePositions[ni * 3 + 2]
      );
    }
  }

  // Reescreve os vértices das linhas a partir de `livePositions`, seguindo a topologia
  // fixa calculada em buildNetwork() (solidPairs / dashedPairs).
  function syncLinePositions() {
    var k;
    if (solidPosAttr) {
      var sArr = solidPosAttr.array;
      for (k = 0; k < solidPairs.length; k += 2) {
        var si = solidPairs[k],
          sj = solidPairs[k + 1];
        var so = k * 3;
        sArr[so] = livePositions[si * 3];
        sArr[so + 1] = livePositions[si * 3 + 1];
        sArr[so + 2] = livePositions[si * 3 + 2];
        sArr[so + 3] = livePositions[sj * 3];
        sArr[so + 4] = livePositions[sj * 3 + 1];
        sArr[so + 5] = livePositions[sj * 3 + 2];
      }
      solidPosAttr.needsUpdate = true;
    }
    if (dashedPosAttr) {
      var dArr = dashedPosAttr.array;
      for (k = 0; k < dashedPairs.length; k += 2) {
        var di = dashedPairs[k],
          dj = dashedPairs[k + 1];
        var doff = k * 3;
        dArr[doff] = livePositions[di * 3];
        dArr[doff + 1] = livePositions[di * 3 + 1];
        dArr[doff + 2] = livePositions[di * 3 + 2];
        dArr[doff + 3] = livePositions[dj * 3];
        dArr[doff + 4] = livePositions[dj * 3 + 1];
        dArr[doff + 5] = livePositions[dj * 3 + 2];
      }
      dashedPosAttr.needsUpdate = true;
      dashedSegments.computeLineDistances();
    }
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

    if (CONFIG.liveMotion) {
      updateLiveMotion(elapsed);
    }

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
