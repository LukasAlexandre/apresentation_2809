/**
 * Backgrounds animados dos slides 02–11 (Canvas 2D, sem dependências).
 *
 * Uma família visual única — pontos, linhas finas e pulsos na mesma paleta azul do slide 01 —
 * com uma "cena" por slide, escolhida para reforçar a mensagem daquele slide (dúvida, ordem,
 * fluxo, registro, construção, progresso, caminho, fechamento).
 *
 * Estabilidade (esta é uma apresentação ao vivo):
 *  - só o slide visível é animado; o resto não gasta nada;
 *  - um único requestAnimationFrame para todos, pausado com a aba oculta;
 *  - DPR limitado a 1.5, sem shadowBlur nem filtros; brilho via sprite pré-renderizado;
 *  - prefers-reduced-motion: desenha um único quadro estático;
 *  - se este script falhar, os slides continuam funcionando (o fundo é só decoração).
 * Nenhum texto é gerado aqui; os canvases ficam atrás do conteúdo (z-index) e com máscara
 * que reduz a intensidade sobre a área do texto (ver .block__fx em styles.css).
 */
(function () {
  "use strict";

  var SCENE_BY_BLOCK = {
    2: "scatter", // O problema — pontos soltos, links que se formam e se desfazem
    3: "order", // A ideia — rede organizada, calma
    4: "flow", // Como funciona — fluxo horizontal
    5: "ledger", // Por que blockchain — cadeia de registros com pulsos
    6: "build", // Como planejamos — progressão em degraus
    7: "ambient", // Nosso time — sistema compartilhado, discreto
    8: "pulse", // O que já construímos — grade técnica com pulsos
    9: "progress", // Onde estamos — varredura de progresso
    10: "path", // Próximos passos — trajetória rumo ao horizonte
    11: "closing", // Resultado — rede solene e centrada
  };

  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  var A = "125,211,252"; // --accent
  // Ganho global de intensidade dos fundos (um só botão para calibrar presença x legibilidade).
  var GAIN = 2.1;
  var rgbaCache = {};
  function rgba(a) {
    var k = Math.round(Math.min(1, a * GAIN) * 100);
    return rgbaCache[k] || (rgbaCache[k] = "rgba(" + A + "," + k / 100 + ")");
  }
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  // Escala a quantidade de elementos pela área do slide (referência: 1920×1080).
  function scaled(n, w, h, min) {
    return Math.max(min || 8, Math.round((n * w * h) / (1920 * 1080)));
  }

  // Sprite de brilho reutilizado por todas as cenas (evita shadowBlur, que é caro).
  var halo = (function () {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(190,235,255,0.95)");
    gr.addColorStop(0.35, "rgba(125,211,252,0.32)");
    gr.addColorStop(1, "rgba(125,211,252,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return c;
  })();

  // Desenha uma vez, fora da tela, tudo o que não muda entre quadros.
  function layer(w, h, fn) {
    var c = document.createElement("canvas");
    c.width = Math.round(w * DPR);
    c.height = Math.round(h * DPR);
    var lg = c.getContext("2d");
    lg.setTransform(DPR, 0, 0, DPR, 0, 0);
    fn(lg);
    return c;
  }

  function glow(g, x, y, r, alpha) {
    if (alpha <= 0.005) return;
    g.globalAlpha = Math.min(1, alpha * GAIN);
    g.drawImage(halo, x - r, y - r, r * 2, r * 2);
    g.globalAlpha = 1;
  }
  function dot(g, x, y, r, alpha) {
    g.fillStyle = rgba(alpha);
    g.beginPath();
    g.arc(x, y, r, 0, 6.2832);
    g.fill();
  }
  function line(g, x1, y1, x2, y2, alpha, width) {
    g.strokeStyle = rgba(alpha);
    g.lineWidth = width || 1;
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
  }

  // ---------------------------------------------------------------------------------------
  // Cenas. Cada fábrica recebe (w, h) e devolve { draw(g, t, dt) }.
  // ---------------------------------------------------------------------------------------

  // 02 — O problema: partículas dispersas; ligações que se formam e se desfazem (algo ainda
  // fragmentado) e um anel de "dúvida" que se expande de tempos em tempos.
  function scatter(w, h) {
    var n = scaled(88, w, h, 30);
    var reach = 165 * clamp(w / 1920, 0.6, 1);
    var P = [];
    for (var i = 0; i < n; i++) {
      P.push({ x: rand(0, w), y: rand(0, h), vx: rand(-12, 12), vy: rand(-9, 9), r: rand(1, 2.1) });
    }
    var rings = [];
    var nextRing = 1.2;
    return {
      draw: function (g, t, dt) {
        var i, j, p, q;
        for (i = 0; i < n; i++) {
          p = P[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x < -20) p.x = w + 20;
          else if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          else if (p.y > h + 20) p.y = -20;
        }
        for (i = 0; i < n; i++) {
          p = P[i];
          for (j = i + 1; j < n; j++) {
            q = P[j];
            var dx = p.x - q.x;
            if (dx > reach || dx < -reach) continue;
            var dy = p.y - q.y;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d >= reach) continue;
            // cada par "pisca" em fase própria: ligações intermitentes
            var ph = Math.sin(t * 0.55 + ((i * 12.9898 + j * 78.233) % 6.2832));
            var a = (1 - d / reach) * 0.2 * Math.max(0, ph);
            if (a > 0.005) line(g, p.x, p.y, q.x, q.y, a);
          }
        }
        for (i = 0; i < n; i++) dot(g, P[i].x, P[i].y, P[i].r, 0.5);
        if (t > nextRing) {
          var s = P[(Math.random() * n) | 0];
          rings.push({ x: s.x, y: s.y, born: t });
          nextRing = t + rand(2.4, 4.2);
        }
        for (i = rings.length - 1; i >= 0; i--) {
          var age = t - rings[i].born;
          if (age > 3.2) {
            rings.splice(i, 1);
            continue;
          }
          g.strokeStyle = rgba(0.2 * (1 - age / 3.2));
          g.lineWidth = 1;
          g.beginPath();
          g.arc(rings[i].x, rings[i].y, age * 70, 0, 6.2832);
          g.stroke();
        }
      },
    };
  }

  // 03 — A ideia: malha organizada, com uma onda lenta de "consolidação" atravessando.
  function order(w, h) {
    var S = clamp(w / 1920, 0.7, 1) * 100;
    var cols = Math.ceil(w / S) + 2;
    var rows = Math.ceil(h / S) + 2;
    return {
      draw: function (g, t) {
        var i, j;
        var pos = function (ci, rj) {
          var bx = ci * S - S * 0.5;
          var by = rj * S - S * 0.5;
          return [
            bx + Math.sin(t * 0.45 + ci * 0.7 + rj * 0.9) * 4,
            by + Math.cos(t * 0.4 + ci * 0.9 - rj * 0.6) * 4,
          ];
        };
        var cache = [];
        for (i = 0; i < cols; i++) {
          cache[i] = [];
          for (j = 0; j < rows; j++) cache[i][j] = pos(i, j);
        }
        for (i = 0; i < cols; i++) {
          for (j = 0; j < rows; j++) {
            var p = cache[i][j];
            var fade = 0.3 + 0.7 * clamp(p[0] / w, 0, 1);
            var wave = Math.max(0, Math.sin(p[0] * 0.0034 + p[1] * 0.0024 - t * 0.7));
            if (i + 1 < cols) line(g, p[0], p[1], cache[i + 1][j][0], cache[i + 1][j][1], (0.06 + wave * 0.1) * fade);
            if (j + 1 < rows) line(g, p[0], p[1], cache[i][j + 1][0], cache[i][j + 1][1], (0.06 + wave * 0.1) * fade);
            dot(g, p[0], p[1], 1.3 + wave * 0.9, (0.2 + wave * 0.5) * fade);
          }
        }
        glow(g, w * 0.8, h * 0.46, w * 0.28, 0.1 + 0.03 * Math.sin(t * 0.5));
      },
    };
  }

  // 04 — Como funciona: correntes que atravessam o slide da esquerda para a direita.
  function flow(w, h) {
    var lanes = clamp(Math.round(h / 80), 8, 16);
    var items = [];
    for (var k = 0; k < lanes; k++) {
      for (var m = 0; m < 4; m++) {
        items.push({
          lane: k,
          x: rand(0, w),
          v: rand(40, 120) * clamp(w / 1920, 0.6, 1.2),
          a: 0.25 + Math.random() * 0.4,
        });
      }
    }
    function yAt(k, x, t) {
      var y0 = ((k + 0.5) * h) / lanes;
      return y0 + (14 + (k % 3) * 9) * Math.sin(x * 0.004 + k * 1.3); // trajetória fixa
    }
    var guides = layer(w, h, function (gg) {
      for (var kk = 0; kk < lanes; kk++) {
        gg.strokeStyle = rgba(0.04);
        gg.lineWidth = 1;
        gg.beginPath();
        for (var xx = 0; xx <= w; xx += 40) {
          var yy = yAt(kk, xx);
          if (xx === 0) gg.moveTo(xx, yy);
          else gg.lineTo(xx, yy);
        }
        gg.stroke();
      }
    });
    return {
      draw: function (g, t, dt) {
        var k, i, q;
        g.drawImage(guides, 0, 0, w, h);
        for (i = 0; i < items.length; i++) {
          var it = items[i];
          it.x += it.v * dt;
          if (it.x > w + 60) it.x = -60;
          var len = it.v * 1.1;
          var px = it.x;
          var py = yAt(it.lane, px, t);
          for (q = 1; q <= 5; q++) {
            var bx = it.x - (len * q) / 5;
            var by = yAt(it.lane, bx, t);
            line(g, px, py, bx, by, it.a * 0.5 * (1 - q / 5.5), 1.2);
            px = bx;
            py = by;
          }
          var hy = yAt(it.lane, it.x, t);
          dot(g, it.x, hy, 1.6, it.a + 0.2);
          glow(g, it.x, hy, 9, it.a * 0.5);
        }
      },
    };
  }

  // 05 — Por que blockchain: cadeias de registros; pulsos percorrem e "acendem" cada nó,
  // deixando rastro (histórico que permanece).
  function ledger(w, h) {
    var m = 11;
    function chain(yy, dir, speed, strength) {
      var nodes = [];
      for (var i = 0; i < m; i++) nodes.push({ x: ((i + 0.5) * w) / m, lit: 0 });
      return { y: yy, dir: dir, speed: speed, s: strength, nodes: nodes, pulses: [{ p: rand(0, 1) }, { p: rand(0, 1) }] };
    }
    var chains = [
      chain(h * 0.9, 1, 0.1, 1),
      chain(h * 0.1, -1, 0.07, 0.7),
      chain(h * 0.76, -1, 0.06, 0.4),
      chain(h * 0.24, 1, 0.08, 0.4),
    ];
    return {
      draw: function (g, t, dt) {
        chains.forEach(function (c) {
          var i, k;
          g.setLineDash([2, 7]);
          line(g, 0, c.y, w, c.y, 0.14 * c.s);
          g.setLineDash([]);
          c.pulses.forEach(function (pl) {
            pl.p += c.speed * dt;
            if (pl.p > 1.15) pl.p = -0.15;
          });
          for (i = 0; i < m; i++) {
            var nd = c.nodes[i];
            var near = 0;
            c.pulses.forEach(function (pl) {
              var px = (c.dir > 0 ? pl.p : 1 - pl.p) * w;
              var dx = nd.x - px;
              near = Math.max(near, Math.exp(-(dx * dx) / (2 * 80 * 80)));
            });
            nd.lit = Math.max(nd.lit * (1 - dt * 0.55), near); // o rastro demora a apagar
            g.strokeStyle = rgba((0.22 + nd.lit * 0.5) * c.s);
            g.lineWidth = 1;
            g.strokeRect(nd.x - 5, c.y - 5, 10, 10);
            dot(g, nd.x, c.y, 1.6 + nd.lit * 1.4, (0.3 + nd.lit * 0.7) * c.s);
            glow(g, nd.x, c.y, 26, nd.lit * 0.55 * c.s);
          }
          c.pulses.forEach(function (pl) {
            var hx = (c.dir > 0 ? pl.p : 1 - pl.p) * w;
            for (k = 1; k <= 10; k++) {
              var tx = hx - c.dir * k * 12;
              line(g, tx + c.dir * 12, c.y, tx, c.y, 0.5 * c.s * (1 - k / 11), 1.5);
            }
            glow(g, hx, c.y, 16, 0.7 * c.s);
          });
        });
      },
    };
  }

  // 06 — Como planejamos: progressão em degraus; um pulso sobe a escada e acende cada etapa.
  function build(w, h) {
    var pts = [];
    for (var i = 0; i < 7; i++) pts.push([w * (0.78 + 0.03 * i), h * (0.9 - 0.1 * i)]);
    var path = [pts[0]];
    for (var s = 1; s < pts.length; s++) {
      path.push([pts[s][0], pts[s - 1][1]]);
      path.push(pts[s]);
    }
    var blueprint = layer(w, h, function (gg) {
      for (var gx = 40; gx < w; gx += 64) {
        for (var gy = 40; gy < h; gy += 64) dot(gg, gx, gy, 0.8, 0.07);
      }
    });
    var seg = [];
    var total = 0;
    for (var k = 1; k < path.length; k++) {
      var l = Math.hypot(path[k][0] - path[k - 1][0], path[k][1] - path[k - 1][1]);
      seg.push(l);
      total += l;
    }
    return {
      draw: function (g, t) {
        var prog = (t * 0.085) % 1.4;
        var fadeAll = prog > 1 ? Math.max(0, 1 - (prog - 1) / 0.4) : 1;
        var reach = Math.min(prog, 1) * total;
        var acc = 0;
        var k;
        // pontos-guia ("planta")
        g.drawImage(blueprint, 0, 0, w, h);
        var head = path[0];
        for (k = 1; k < path.length; k++) {
          var a = path[k - 1];
          var b = path[k];
          line(g, a[0], a[1], b[0], b[1], 0.1, 1);
          var done = clamp((reach - acc) / seg[k - 1], 0, 1);
          if (done > 0) {
            var ex = a[0] + (b[0] - a[0]) * done;
            var ey = a[1] + (b[1] - a[1]) * done;
            line(g, a[0], a[1], ex, ey, 0.5 * fadeAll, 1.6);
            head = [ex, ey];
          }
          acc += seg[k - 1];
        }
        acc = 0;
        for (k = 0; k < pts.length; k++) {
          var lit = k === 0 ? 1 : clamp((reach - segUpTo(k)) / 30 + 1, 0, 1);
          g.strokeStyle = rgba((0.2 + lit * 0.5) * (lit > 0.5 ? fadeAll : 1));
          g.lineWidth = 1;
          g.strokeRect(pts[k][0] - 5, pts[k][1] - 5, 10, 10);
          glow(g, pts[k][0], pts[k][1], 24, lit * 0.4 * fadeAll);
        }
        glow(g, head[0], head[1], 20, 0.8 * fadeAll);
        dot(g, head[0], head[1], 2, 0.9 * fadeAll);
      },
    };
    function segUpTo(index) {
      // comprimento percorrido até o vértice de degrau `index` (cada degrau = 2 trechos)
      var sum = 0;
      for (var q = 0; q < index * 2; q++) sum += seg[q];
      return sum;
    }
  }

  // 07 — Nosso time: partículas suaves e brilho ambiente; "sistema compartilhado", discreto.
  function ambient(w, h) {
    var n = scaled(58, w, h, 24);
    var reach = 150 * clamp(w / 1920, 0.6, 1);
    var P = [];
    for (var i = 0; i < n; i++) P.push({ x: rand(0, w), y: rand(0, h), vx: rand(-9, 9), vy: rand(-7, 7), r: rand(0.9, 1.8) });
    return {
      draw: function (g, t, dt) {
        var i, j, p, q;
        glow(g, w * (0.3 + 0.2 * Math.sin(t * 0.13)), h * (0.5 + 0.15 * Math.cos(t * 0.11)), w * 0.3, 0.07);
        glow(g, w * (0.75 + 0.1 * Math.cos(t * 0.1)), h * (0.4 + 0.2 * Math.sin(t * 0.09)), w * 0.26, 0.06);
        for (i = 0; i < n; i++) {
          p = P[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x < -10) p.x = w + 10;
          else if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          else if (p.y > h + 10) p.y = -10;
        }
        for (i = 0; i < n; i++) {
          p = P[i];
          for (j = i + 1; j < n; j++) {
            q = P[j];
            var dx = p.x - q.x;
            if (dx > reach || dx < -reach) continue;
            var dy = p.y - q.y;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d < reach) line(g, p.x, p.y, q.x, q.y, (1 - d / reach) * 0.12);
          }
          dot(g, p.x, p.y, p.r, 0.4);
        }
      },
    };
  }

  // 08 — O que já construímos: grade técnica fina, com pulsos que acendem os cruzamentos.
  function pulse(w, h) {
    var G = clamp(w / 1920, 0.7, 1) * 112;
    var rings = [];
    var next = 0.5;
    var grid = layer(w, h, function (gg) {
      var gx, gy;
      gg.strokeStyle = rgba(0.035);
      gg.lineWidth = 1;
      gg.beginPath();
      for (gx = 0; gx <= w; gx += G) {
        gg.moveTo(gx, 0);
        gg.lineTo(gx, h);
      }
      for (gy = 0; gy <= h; gy += G) {
        gg.moveTo(0, gy);
        gg.lineTo(w, gy);
      }
      gg.stroke();
      for (gx = 0; gx <= w; gx += G) {
        for (gy = 0; gy <= h; gy += G) dot(gg, gx, gy, 1.1, 0.12);
      }
    });
    return {
      draw: function (g, t) {
        var x, y, i;
        g.drawImage(grid, 0, 0, w, h);
        if (t > next) {
          rings.push({ x: Math.round(rand(2, w / G - 2)) * G, y: Math.round(rand(1, h / G - 1)) * G, born: t });
          next = t + rand(2.2, 3.6);
        }
        for (i = rings.length - 1; i >= 0; i--) if (t - rings[i].born > 4.2) rings.splice(i, 1);
        if (rings.length) {
          for (x = 0; x <= w; x += G) {
            for (y = 0; y <= h; y += G) {
              var b = 0;
              for (i = 0; i < rings.length; i++) {
                var age = t - rings[i].born;
                var r = age * 110;
                var d = Math.hypot(x - rings[i].x, y - rings[i].y);
                b = Math.max(b, Math.exp(-((d - r) * (d - r)) / (2 * 38 * 38)) * (1 - age / 4.2));
              }
              if (b > 0.04) {
                dot(g, x, y, 1.1 + b * 1.6, b * 0.7);
                if (b > 0.1) glow(g, x, y, 22, b * 0.5);
              }
            }
          }
        }
        for (i = 0; i < rings.length; i++) {
          var ag = t - rings[i].born;
          g.strokeStyle = rgba(0.14 * (1 - ag / 4.2));
          g.beginPath();
          g.arc(rings[i].x, rings[i].y, ag * 110, 0, 6.2832);
          g.stroke();
        }
      },
    };
  }

  // 09 — Onde estamos: riscos de luz que avançam e uma varredura de progresso na base.
  function progress(w, h) {
    var n = scaled(46, w, h, 20);
    var S = [];
    for (var i = 0; i < n; i++) {
      S.push({ x: rand(0, w), y: rand(0, h), len: rand(70, 260), v: rand(40, 170), a: rand(0.05, 0.2), lw: Math.random() < 0.3 ? 2 : 1 });
    }
    return {
      draw: function (g, t, dt) {
        var i;
        var bg = g.createLinearGradient(0, h, 0, h * 0.62);
        bg.addColorStop(0, rgba((0.07 + 0.025 * Math.sin(t * 0.6))));
        bg.addColorStop(1, rgba(0));
        g.fillStyle = bg;
        g.fillRect(0, h * 0.62, w, h * 0.38);
        for (i = 0; i < n; i++) {
          var s = S[i];
          s.x += s.v * dt;
          if (s.x - s.len > w) {
            s.x = -20;
            s.y = rand(0, h);
          }
          var gr = g.createLinearGradient(s.x - s.len, 0, s.x, 0);
          gr.addColorStop(0, rgba(0));
          gr.addColorStop(1, rgba(s.a));
          g.strokeStyle = gr;
          g.lineWidth = s.lw;
          g.beginPath();
          g.moveTo(s.x - s.len, s.y);
          g.lineTo(s.x, s.y);
          g.stroke();
        }
        // varredura de progresso: segmento brilhante que avança pela base
        var by = h - 3;
        line(g, 0, by, w, by, 0.08);
        var sx = ((t * 0.12) % 1.3) * w - w * 0.15;
        var sg = g.createLinearGradient(sx - w * 0.22, 0, sx, 0);
        sg.addColorStop(0, rgba(0));
        sg.addColorStop(1, rgba(0.55));
        g.strokeStyle = sg;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(sx - w * 0.22, by);
        g.lineTo(sx, by);
        g.stroke();
        glow(g, sx, by, 26, 0.7);
      },
    };
  }

  // 10 — Próximos passos: linhas que convergem para um horizonte; pontos avançam até ele.
  function path(w, h) {
    var vx = w * 0.9;
    var vy = h * 0.5;
    var K = 9;
    var lines = [];
    for (var k = 0; k < K; k++) {
      var sy = -h * 0.15 + ((k + 0.5) * h * 1.3) / K;
      var dots = [];
      for (var m = 0; m < 3; m++) dots.push({ u: Math.random(), v: rand(0.05, 0.11) });
      lines.push({ sx: -w * 0.04, sy: sy, dots: dots });
    }
    return {
      draw: function (g, t, dt) {
        glow(g, vx, vy, w * 0.2, 0.12 + 0.03 * Math.sin(t * 0.6));
        lines.forEach(function (l) {
          line(g, l.sx, l.sy, vx, vy, 0.045);
          l.dots.forEach(function (d) {
            d.u += d.v * dt;
            if (d.u > 1) d.u = 0;
            var e = d.u * d.u * 0.4 + d.u * 0.6; // aceleração suave no início
            var x = l.sx + (vx - l.sx) * e;
            var y = l.sy + (vy - l.sy) * e;
            var a = Math.sin(Math.PI * d.u);
            dot(g, x, y, 0.8 + (1 - d.u) * 1.5, a * 0.65);
            glow(g, x, y, 8 + (1 - d.u) * 8, a * 0.35);
          });
        });
      },
    };
  }

  // 11 — Resultado esperado: rede solene e centrada, em leve órbita, com brilho central.
  function closing(w, h) {
    var n = scaled(150, w, h, 60);
    var cx = w * 0.5;
    var cy = h * 0.47;
    var reach = 150 * clamp(w / 1920, 0.6, 1);
    var P = [];
    function gauss() {
      var u = 0;
      var v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    for (var i = 0; i < n; i++) {
      P.push({ x: gauss() * w * 0.25, y: gauss() * h * 0.24, z: rand(0.25, 1), ph: rand(0, 6.28) });
    }
    var pos = [];
    return {
      draw: function (g, t) {
        var i, j;
        glow(g, cx, cy, w * 0.34, 0.1 + 0.025 * Math.sin(t * 0.5));
        var ang = t * 0.025;
        var ca = Math.cos(ang);
        var sa = Math.sin(ang);
        for (i = 0; i < n; i++) {
          var p = P[i];
          var br = 1 + 0.035 * Math.sin(t * 0.4 + p.ph);
          pos[i] = [
            cx + (p.x * ca - p.y * sa) * br + mouse.x * 26 * p.z,
            cy + (p.x * sa + p.y * ca) * br + mouse.y * 18 * p.z,
          ];
        }
        for (i = 0; i < n; i++) {
          for (j = i + 1; j < n; j++) {
            var dx = pos[i][0] - pos[j][0];
            if (dx > reach || dx < -reach) continue;
            var dy = pos[i][1] - pos[j][1];
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d < reach) line(g, pos[i][0], pos[i][1], pos[j][0], pos[j][1], (1 - d / reach) * 0.16 * (P[i].z + P[j].z) * 0.6);
          }
        }
        for (i = 0; i < n; i++) {
          dot(g, pos[i][0], pos[i][1], 0.9 + P[i].z * 1.3, 0.25 + P[i].z * 0.45);
          if (i % 9 === 0) glow(g, pos[i][0], pos[i][1], 14, 0.35 * P[i].z);
        }
      },
    };
  }

  var FACTORY = { scatter: scatter, order: order, flow: flow, ledger: ledger, build: build, ambient: ambient, pulse: pulse, progress: progress, path: path, closing: closing };

  // ---------------------------------------------------------------------------------------
  // Motor: um canvas por slide, um único loop, só o slide visível é desenhado.
  // ---------------------------------------------------------------------------------------
  var instances = [];

  function setup(section) {
    var idx = Number(section.getAttribute("data-block"));
    var name = SCENE_BY_BLOCK[idx];
    if (!name || !FACTORY[name]) return;
    var canvas = document.createElement("canvas");
    canvas.className = "block__fx block__fx--" + name;
    canvas.setAttribute("aria-hidden", "true");
    section.insertBefore(canvas, section.firstChild);
    var inst = { section: section, canvas: canvas, g: canvas.getContext("2d"), name: name, w: 0, h: 0, scene: null, visible: false };
    instances.push(inst);
    resize(inst);
    if ("ResizeObserver" in window) {
      new ResizeObserver(function () {
        resize(inst);
      }).observe(section);
    }
  }

  function resize(inst) {
    var w = inst.section.clientWidth;
    var h = inst.section.clientHeight;
    if (!w || !h || (w === inst.w && h === inst.h)) return;
    inst.w = w;
    inst.h = h;
    inst.canvas.width = Math.round(w * DPR);
    inst.canvas.height = Math.round(h * DPR);
    inst.g.setTransform(DPR, 0, 0, DPR, 0, 0);
    inst.scene = FACTORY[inst.name](w, h);
    if (reduceMotionQuery.matches) drawFrame(inst, 8, 0.016); // quadro estático
  }

  function drawFrame(inst, t, dt) {
    if (!inst.scene) return;
    inst.g.clearRect(0, 0, inst.w, inst.h);
    inst.scene.draw(inst.g, t, dt);
  }

  var raf = null;
  var last = 0;
  var clock = 0;

  function anyVisible() {
    return instances.some(function (i) {
      return i.visible;
    });
  }

  function tick(now) {
    raf = null;
    if (document.hidden || !anyVisible() || reduceMotionQuery.matches) return;
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    clock += dt;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    for (var i = 0; i < instances.length; i++) {
      if (instances[i].visible) drawFrame(instances[i], clock, dt);
    }
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (raf !== null || reduceMotionQuery.matches || document.hidden || !anyVisible()) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function init() {
    Array.prototype.slice.call(document.querySelectorAll("[data-block]")).forEach(function (s) {
      if (!s.classList.contains("hero")) setup(s);
    });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            for (var i = 0; i < instances.length; i++) {
              if (instances[i].section === e.target) instances[i].visible = e.isIntersecting;
            }
          });
          start();
        },
        { threshold: 0.05 }
      );
      instances.forEach(function (i) {
        io.observe(i.section);
      });
    } else {
      instances.forEach(function (i) {
        i.visible = true;
      });
      start();
    }
    document.addEventListener("visibilitychange", start);
    if (!(window.matchMedia("(pointer: coarse)").matches || reduceMotionQuery.matches)) {
      window.addEventListener(
        "mousemove",
        function (e) {
          mouse.tx = e.clientX / window.innerWidth - 0.5;
          mouse.ty = e.clientY / window.innerHeight - 0.5;
        },
        { passive: true }
      );
    }
    if (reduceMotionQuery.addEventListener) {
      reduceMotionQuery.addEventListener("change", function () {
        if (reduceMotionQuery.matches) {
          instances.forEach(function (i) {
            drawFrame(i, 8, 0.016);
          });
        } else start();
      });
    }
  }

  try {
    init();
  } catch (err) {
    // Fundo é só decoração: se algo falhar, a apresentação segue normalmente.
    if (window.console && console.warn) console.warn("bg.js desativado:", err);
  }
})();
