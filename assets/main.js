/* Tom Giles — portfolio. Aucune dépendance.
   Modules : thème, barre du haut, simulation de cluster (hero + carte SIOPS),
   révélations au scroll, compteurs, filtres, stack, timeline, terminal. */
(function () {
  "use strict";

  var root = document.documentElement;
  var EN = root.lang === "en";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

  var T = EN ? {
    copied: "Email copied to clipboard", copy: "Copy", copyDone: "Copied ✓",
    usedIn: "Used in", project: "project", projects: "projects"
  } : {
    copied: "Adresse copiée dans le presse-papiers", copy: "Copier", copyDone: "Copié ✓",
    usedIn: "Utilisé dans", project: "projet", projects: "projets"
  };

  function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var desktopPin = window.matchMedia("(min-width: 901px)");

  /* ================================================================ curseur */

  var cursor = $(".cursor");
  if (cursor && finePointer && !reduced) {
    var cx = -100, cy = -100, tx = -100, ty = -100;
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add("on");
      var hot = e.target.closest && e.target.closest("a, button, summary, .tech[data-n], input");
      cursor.classList.toggle("hover", !!hot);
    }, { passive: true });
    document.addEventListener("pointerleave", function () { cursor.classList.remove("on"); });
    (function follow() {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2;
      cursor.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      requestAnimationFrame(follow);
    })();
  }

  /* ================================================================ menu mobile + nav */

  var menuBtn = $(".menu-btn");
  var nav = $("#nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  var navLinks = $$(".nav a[href^='#']");
  if (navLinks.length && "IntersectionObserver" in window) {
    var visible = new Set();
    var targets = navLinks.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id); });
      var first = targets.find(function (t) { return visible.has(t.id); });
      navLinks.forEach(function (a) {
        if (first && a.getAttribute("href") === "#" + first.id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    targets.forEach(function (t) { navObs.observe(t); });
  }
  /* ================================================================ cluster : modèle partagé */

  var APPS = ["cassiopee-api", "cassiopee-web", "argocd-server", "argocd-repo", "vault-0", "prometheus",
    "grafana", "loki", "alloy", "gatus", "client-a-web", "client-b-api", "client-c-front", "client-d-worker",
    "postgres-0", "rabbitmq-0", "ingress-nginx", "cert-manager", "restic-backup"];
  function hash() { return Math.random().toString(36).slice(2, 7); }
  function podName(app) { return app + "-" + hash(); }

  var cluster = {
    nodes: ["master-1", "master-2", "master-3", "worker-1", "worker-2", "worker-3"].map(function (n) {
      return { name: n, master: n.indexOf("master") === 0, pods: [] };
    }),
    listeners: [],
    emit: function (ev) { this.listeners.forEach(function (f) { f(ev); }); }
  };
  var CAP = 8;
  cluster.nodes.forEach(function (n) {
    var k = n.master ? 3 + Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 2);
    for (var i = 0; i < k; i++) n.pods.push(newPod(pick(APPS), true));
  });
  function newPod(app, ready) {
    return { app: app, name: podName(app), state: ready ? "run" : "pend", born: performance.now(), angle: rand(0, Math.PI * 2), orbit: rand(34, 62), speed: rand(.00008, .00022) * (Math.random() < .5 ? -1 : 1), life: ready ? 1 : 0 };
  }
  function leastLoaded(except) {
    var ws = cluster.nodes.filter(function (n) { return n !== except && n.pods.length < CAP; });
    ws.sort(function (a, b) { return a.pods.length - b.pods.length + (a.master ? 2 : 0) - (b.master ? 2 : 0); });
    return ws[0];
  }

  function tick() {
    var r = Math.random();
    var node, pod;
    if (r < .38) {
      // déploiement ArgoCD
      node = leastLoaded();
      if (!node) return;
      pod = newPod(pick(APPS), false);
      node.pods.push(pod);
      cluster.emit({ kind: "sync", node: node, pod: pod,
        text: '<span class="ok">Synced</span> argocd/' + pod.app + " → " + node.name });
      setTimeout(function () {
        pod.state = "run";
        cluster.emit({ kind: "ready", node: node, pod: pod, text: '<span class="ok">Started</span> ' + pod.name + " on " + node.name });
      }, rand(900, 1800));
    } else if (r < .55) {
      // OOMKilled puis replanifié
      node = pick(cluster.nodes.filter(function (n) { return n.pods.length > 3; }));
      if (!node) return;
      pod = pick(node.pods.filter(function (p) { return p.state === "run"; }));
      if (!pod) return;
      pod.state = "bad";
      cluster.emit({ kind: "fail", node: node, pod: pod, text: '<span class="err">OOMKilled</span> ' + pod.name + " on " + node.name });
      setTimeout(function () {
        var i = node.pods.indexOf(pod);
        if (i >= 0) node.pods.splice(i, 1);
        var dest = leastLoaded(node) || node;
        var np = newPod(pod.app, false);
        dest.pods.push(np);
        cluster.emit({ kind: "resched", from: node, node: dest, pod: np,
          text: '<span class="warn">Rescheduled</span> ' + np.name + " → " + dest.name });
        setTimeout(function () {
          np.state = "run";
          cluster.emit({ kind: "ready", node: dest, pod: np, text: '<span class="ok">Healthy</span> ' + np.name + " (probe OK)" });
        }, rand(1000, 1600));
      }, 1400);
    } else if (r < .72) {
      // scale down
      node = pick(cluster.nodes.filter(function (n) { return n.pods.length > 4; }));
      if (!node) return;
      pod = node.pods[node.pods.length - 1];
      pod.state = "dying";
      cluster.emit({ kind: "kill", node: node, pod: pod, text: '<span class="dim">Killing</span> ' + pod.name + " (scale down)" });
      setTimeout(function () {
        var i = node.pods.indexOf(pod);
        if (i >= 0) node.pods.splice(i, 1);
        cluster.emit({ kind: "gone", node: node });
      }, 900);
    } else {
      // trafic / sondes
      var a = pick(cluster.nodes), b = pick(cluster.nodes.filter(function (n) { return n !== a; }));
      var msgs = [
        '<span class="ok">Probe</span> gatus → ' + pick(APPS) + " 200 OK",
        '<span class="ok">Scrape</span> prometheus ← ' + b.name + " /metrics",
        '<span class="ok">Snapshot</span> restic ' + hash() + " saved",
        '<span class="ok">Lease</span> etcd leader ' + pick(["master-1", "master-2", "master-3"])
      ];
      cluster.emit({ kind: "traffic", from: a, node: b, text: pick(msgs) });
    }
  }

  var clusterRunning = false;
  function scheduleTick() {
    if (!clusterRunning) return;
    setTimeout(function () {
      if (!document.hidden) tick();
      scheduleTick();
    }, rand(reduced ? 3000 : 1100, reduced ? 5000 : 2300));
  }
  function startCluster() { if (!clusterRunning) { clusterRunning = true; scheduleTick(); } }

  // flux d'événements
  var feed = $(".feed ol");
  if (feed) {
    var stamp = function () { var d = new Date(); return ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2); };
    cluster.listeners.push(function (ev) {
      if (!ev.text) return;
      var li = document.createElement("li");
      li.innerHTML = '<span class="dim">' + stamp() + "</span> " + ev.text;
      feed.appendChild(li);
      while (feed.children.length > 4) feed.removeChild(feed.firstChild);
    });
  }

  // mini-grille de la carte SIOPS
  var grid = $("[data-nodes]");
  if (grid) {
    var renderGrid = function () {
      grid.innerHTML = cluster.nodes.map(function (n) {
        var cells = "";
        for (var i = 0; i < CAP; i++) {
          var p = n.pods[i];
          var cls = !p ? "off" : p.state === "bad" ? "bad" : p.state === "pend" ? "pend" : p.state === "dying" ? "off" : "";
          cells += '<i class="' + cls + '"></i>';
        }
        return '<div class="node">' + n.name + '<div class="node__pods">' + cells + "</div></div>";
      }).join("");
    };
    renderGrid();
    cluster.listeners.push(renderGrid);
    startCluster();
  }

  /* ================================================================ cluster : rendu canvas du hero */

  var canvas = $(".hero__canvas");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentElement;
    var W = 0, H = 0, DPR = 1, C = {};
    var mouse = { x: -9999, y: -9999, active: false };
    var packets = [];
    var sparks = [];
    var visibleHero = true;

    var readColors = function () {
      C = { accent: cssVar("--accent"), accent2: cssVar("--accent-2"), warn: cssVar("--warn"),
            danger: cssVar("--danger"), ink3: cssVar("--ink-3"), line: cssVar("--line-strong"), bg: cssVar("--bg") };
    };
    readColors();

    var layout = function () {
      var r = hero.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      var wide = W > 900;
      var cx = W * .5, cy = H * .5;
      var rx = wide ? W * .37 : W * .44, ry = wide ? H * .4 : H * .36;
      // nœuds répartis sur les côtés d'une ellipse : le centre reste libre pour le texte
      var ANG = [180, 0, 208, 152, 332, 28];
      cluster.nodes.forEach(function (n, i) {
        var a = ANG[i] * Math.PI / 180;
        n.bx = cx + Math.cos(a) * rx;
        n.by = cy + Math.sin(a) * ry;
        n.seed = n.seed || rand(0, 1000);
      });
      canvas.style.opacity = wide ? .9 : .35;
    };

    var rgba = function (hex, a) {
      if (!hex) return "rgba(0,0,0," + a + ")";
      if (hex.indexOf("rgb") === 0) return hex;
      var h = hex.replace("#", "");
      if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
      var n = parseInt(h, 16);
      return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")";
    };

    var podPos = function (n, p, t) {
      var a = p.angle + t * p.speed;
      var x = n.x + Math.cos(a) * p.orbit, y = n.y + Math.sin(a) * p.orbit;
      if (mouse.active) {
        var dx = x - mouse.x, dy = y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110 && d > 0) { var f = (110 - d) / 110 * 16; x += dx / d * f; y += dy / d * f; }
      }
      return [x, y];
    };

    cluster.listeners.push(function (ev) {
      if (reduced) { draw(performance.now()); return; }
      if (ev.kind === "sync") {
        // paquet depuis argocd (master-1) vers le nœud cible
        packets.push({ from: cluster.nodes[0], to: ev.node, t: 0, color: C.accent2, speed: .012 });
      } else if (ev.kind === "resched" && ev.from) {
        packets.push({ from: ev.from, to: ev.node, t: 0, color: C.warn, speed: .014 });
      } else if (ev.kind === "traffic" && ev.from) {
        packets.push({ from: ev.from, to: ev.node, t: 0, color: C.accent, speed: .02 });
      } else if (ev.kind === "fail") {
        sparks.push({ node: ev.node, pod: ev.pod, t: 0 });
      }
    });

    var edges = [];
    cluster.nodes.forEach(function (a, i) {
      cluster.nodes.forEach(function (b, j) {
        if (j <= i) return;
        if (a.master || b.master) edges.push([a, b]);
      });
    });

    var draw = function (t) {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      cluster.nodes.forEach(function (n) {
        n.x = n.bx + (reduced ? 0 : Math.sin(t * .0004 + n.seed) * 8);
        n.y = n.by + (reduced ? 0 : Math.cos(t * .0005 + n.seed) * 8);
      });

      // arêtes
      ctx.lineWidth = 1;
      edges.forEach(function (e) {
        var both = e[0].master && e[1].master;
        ctx.strokeStyle = rgba(both ? C.accent2 : C.ink3, both ? .35 : .14);
        ctx.setLineDash(both ? [] : [3, 6]);
        ctx.beginPath(); ctx.moveTo(e[0].x, e[0].y); ctx.lineTo(e[1].x, e[1].y); ctx.stroke();
      });
      ctx.setLineDash([]);

      // liens vers le curseur
      if (mouse.active) {
        cluster.nodes.forEach(function (n) {
          var dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 260) {
            ctx.strokeStyle = rgba(C.accent, (1 - d / 260) * .6);
            ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(n.x, n.y); ctx.stroke();
          }
        });
        ctx.fillStyle = rgba(C.accent, .9);
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2); ctx.fill();
      }

      // paquets
      packets = packets.filter(function (p) {
        p.t += p.speed;
        if (p.t >= 1) return false;
        var e = p.t < .5 ? 2 * p.t * p.t : 1 - Math.pow(-2 * p.t + 2, 2) / 2;
        var x = p.from.x + (p.to.x - p.from.x) * e, y = p.from.y + (p.to.y - p.from.y) * e;
        var g = ctx.createRadialGradient(x, y, 0, x, y, 14);
        g.addColorStop(0, rgba(p.color, .9)); g.addColorStop(1, rgba(p.color, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
        return true;
      });

      // nœuds + pods
      cluster.nodes.forEach(function (n) {
        var col = n.master ? C.accent2 : C.accent;
        ctx.strokeStyle = rgba(col, .18);
        ctx.beginPath(); ctx.arc(n.x, n.y, 62, 0, Math.PI * 2); ctx.stroke();

        var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 30);
        g.addColorStop(0, rgba(col, .35)); g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, 30, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = C.bg || "#000";
        ctx.strokeStyle = rgba(col, .9);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (var k = 0; k < 6; k++) {
          var a = Math.PI / 3 * k + Math.PI / 6;
          var px = n.x + Math.cos(a) * 13, py = n.y + Math.sin(a) * 13;
          if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.lineWidth = 1;

        ctx.fillStyle = rgba(C.ink3, .9);
        ctx.font = "500 10px 'Geist Mono', ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(n.name, n.x, n.y + 82);

        n.pods.forEach(function (p) {
          if (p.state === "run" || p.state === "bad") p.life = Math.min(1, p.life + .04);
          else if (p.state === "pend") p.life = Math.min(.6, p.life + .02);
          else if (p.state === "dying") p.life = Math.max(0, p.life - .05);
          var pos = podPos(n, p, t);
          var c = p.state === "bad" ? C.danger : p.state === "pend" ? C.warn : col;
          ctx.strokeStyle = rgba(c, .12 * p.life);
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(pos[0], pos[1]); ctx.stroke();
          ctx.fillStyle = rgba(c, p.life);
          ctx.beginPath(); ctx.arc(pos[0], pos[1], p.state === "bad" ? 4 : 3, 0, Math.PI * 2); ctx.fill();
          if (p.state === "pend") {
            ctx.strokeStyle = rgba(c, .6);
            ctx.beginPath(); ctx.arc(pos[0], pos[1], 6 + Math.sin(t * .01) * 1.5, 0, Math.PI * 2); ctx.stroke();
          }
        });
      });

      // étincelles d'échec
      sparks = sparks.filter(function (s) {
        s.t += .02;
        if (s.t >= 1) return false;
        var pos = podPos(s.node, s.pod, t);
        ctx.strokeStyle = rgba(C.danger, 1 - s.t);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(pos[0], pos[1], 4 + s.t * 26, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 1;
        return true;
      });
    };

    var loop = function (t) {
      if (visibleHero && !document.hidden) draw(t);
      requestAnimationFrame(loop);
    };

    layout();
    window.addEventListener("resize", function () { layout(); if (reduced) draw(performance.now()); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (reduced) draw(performance.now()); });

    if (finePointer) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
      });
      hero.addEventListener("pointerleave", function () { mouse.active = false; });
      hero.addEventListener("click", function (e) {
        if (e.target.closest("a,button")) return;
        // clic : déclenche un déploiement
        tick();
      });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visibleHero = en[0].isIntersecting; }).observe(hero);
    }

    if (reduced) draw(performance.now());
    else requestAnimationFrame(loop);
    startCluster();
  }

  /* ================================================================ texte tapé */

  var typer = $(".typer");
  if (typer && !reduced) {
    var words = typer.getAttribute("data-words").split("|");
    var wi = 0, ci = words[0].length, deleting = true;
    var step = function () {
      var w = words[wi];
      if (deleting) {
        ci--;
        if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; }
      } else {
        ci++;
        if (ci >= words[wi].length) { deleting = true; typer.textContent = words[wi]; setTimeout(step, 2200); return; }
      }
      typer.textContent = (deleting ? w : words[wi]).slice(0, Math.max(ci, 0));
      setTimeout(step, deleting ? 35 : 70);
    };
    setTimeout(step, 2600);
  }

  /* ================================================================ révélations + compteurs */

  var countUp = function (el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    if (reduced) { el.textContent = prefix + target; return; }
    var t0 = performance.now(), dur = 1300;
    var f = function (t) {
      var k = Math.min(1, (t - t0) / dur);
      el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - k, 4)));
      if (k < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  };

  if ("IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        revObs.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    $$(".reveal, .meter").forEach(function (el) { revObs.observe(el); });
  } else {
    $$(".reveal, .meter").forEach(function (el) { el.classList.add("in"); });
  }

  /* ================================================================ cartes : halo sous le pointeur */

  $$(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  // boutons magnétiques
  if (finePointer && !reduced) {
    $$(".magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = "translate(" + x * .25 + "px," + y * .35 + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ================================================================ moteur de scroll
     Un seul passage par frame : hero, manifeste, chiffres, bandeau, galerie
     horizontale, timeline, barre du haut, progression. */

  var topbar = $(".topbar");
  var progress = $(".progress");
  var heroInner = $("[data-hero]");
  var heroSec = $(".hero");
  var statement = $(".statement");
  var stWords = statement ? $$(".w", statement) : [];
  var numbersSec = $(".numbers");
  var nums = numbersSec ? $$(".num", numbersSec) : [];
  var dots = numbersSec ? $$(".numbers__dots i", numbersSec) : [];
  var bandRows = $$("[data-band]");
  var band = $(".band");
  var hs = $("[data-hscroll]");
  var hsTrack = hs && $(".hscroll__track", hs);
  var hsBar = hs && $(".hscroll__bar", hs);
  var tl = $(".timeline-wrap");
  var tlFill = tl && $(".timeline__fill", tl);
  var tlItems = tl ? $$(".timeline li", tl) : [];
  var hsDist = 0;
  var lastY = window.scrollY;

  var sectionProgress = function (el) {
    var r = el.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    return span > 0 ? clamp(-r.top / span, 0, 1) : (r.top < 0 ? 1 : 0);
  };

  var sizeHscroll = function () {
    if (!hs) return;
    if (!desktopPin.matches || reduced) { hs.style.height = ""; hsDist = 0; hsTrack.style.transform = ""; return; }
    hsDist = Math.max(0, hsTrack.scrollWidth - window.innerWidth);
    hs.style.height = (hsDist + window.innerHeight) + "px";
  };

  var frame = function () {
    var y = window.scrollY, vh = window.innerHeight;

    if (topbar) {
      topbar.classList.toggle("scrolled", y > 20);
      topbar.classList.toggle("hide", y > vh && y > lastY + 2 && !(nav && nav.classList.contains("open")));
      if (y < lastY - 2) topbar.classList.remove("hide");
    }
    lastY = y;
    if (progress) {
      var max = document.documentElement.scrollHeight - vh;
      progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    }

    if (heroInner && heroSec && !reduced) heroInner.style.setProperty("--hp", clamp(y / (heroSec.offsetHeight * .85), 0, 1).toFixed(3));

    if (statement && !reduced) {
      var sp = sectionProgress(statement);
      var lit = Math.round(clamp(sp * 1.25, 0, 1) * stWords.length);
      stWords.forEach(function (w, i) { w.classList.toggle("lit", i < lit); });
    }

    if (numbersSec && !reduced) {
      var np = sectionProgress(numbersSec);
      var idx = Math.min(nums.length - 1, Math.floor(np * nums.length));
      var inView = numbersSec.getBoundingClientRect().top < vh * .5;
      nums.forEach(function (n, i) {
        var on = inView && i === idx;
        n.classList.toggle("on", on);
        n.classList.toggle("past", i < idx);
        if (on) $$("[data-count]", n).forEach(countUp);
      });
      dots.forEach(function (d, i) { d.classList.toggle("on", i === idx); });
    }

    if (band && !reduced) {
      var br = band.getBoundingClientRect();
      if (br.bottom > 0 && br.top < vh) {
        var off = (vh - br.top) * .35;
        bandRows.forEach(function (row) {
          var dir = parseFloat(row.getAttribute("data-band"));
          row.style.transform = "translate3d(" + (dir > 0 ? off - row.scrollWidth / 4 : -off) + "px,0,0)";
        });
      }
    }

    if (hs && hsDist > 0) {
      var hp = sectionProgress(hs);
      hsTrack.style.transform = "translate3d(" + (-hp * hsDist) + "px,0,0)";
      if (hsBar) hsBar.style.setProperty("--hx", hp.toFixed(4));
    }

    if (tl) {
      var tr = tl.getBoundingClientRect(), mid = vh * .6;
      if (tlFill) tlFill.style.setProperty("--t", clamp((mid - tr.top) / tr.height, 0, 1).toFixed(3));
      tlItems.forEach(function (li) { li.classList.toggle("lit", li.getBoundingClientRect().top < mid); });
    }
  };

  // barre de progression du carrousel natif (mobile)
  if (hsTrack && hsBar) {
    hsTrack.addEventListener("scroll", function () {
      if (desktopPin.matches) return;
      var m = hsTrack.scrollWidth - hsTrack.clientWidth;
      hsBar.style.setProperty("--hx", m > 0 ? (hsTrack.scrollLeft / m).toFixed(4) : 0);
    }, { passive: true });
  }

  var ticking = false;
  var onScroll = function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; frame(); });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { sizeHscroll(); frame(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { sizeHscroll(); frame(); });
  sizeHscroll();
  frame();

  /* ================================================================ filtres de projets */

  var filters = $$(".filter");
  var cards = $$(".hscroll__track .card");
  var CATS = ["platform", "sre", "software", "consulting", "product"];
  if (filters.length) {
    filters.forEach(function (f) {
      var cat = f.getAttribute("data-filter");
      var n = cat === "all" ? cards.length : cards.filter(function (c) { return c.getAttribute("data-cat") === cat; }).length;
      var cnt = $(".filter__count", f);
      if (cnt) cnt.textContent = n;
    });
    var apply = function (cat, scroll) {
      var run = function () {
        filters.forEach(function (f) { f.setAttribute("aria-pressed", f.getAttribute("data-filter") === cat); });
        cards.forEach(function (c) { c.classList.toggle("is-hidden", cat !== "all" && c.getAttribute("data-cat") !== cat); });
        sizeHscroll();
        if (hsTrack) hsTrack.scrollLeft = 0;
        frame();
      };
      if (document.startViewTransition && !reduced) document.startViewTransition(run);
      else run();
      // ramène au début de la galerie pour voir le résultat du filtre
      if (scroll !== false && hs) {
        var top = hs.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
      }
    };
    filters.forEach(function (f) {
      f.addEventListener("click", function () { apply(f.getAttribute("data-filter")); });
    });
    var fromHash = function () {
      var h = location.hash.slice(1);
      if (CATS.indexOf(h) >= 0) {
        apply(h, false);
        var p = $("#projets");
        if (p) setTimeout(function () { p.scrollIntoView(); }, 50);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
  }

  /* ================================================================ stack : projets par outil */

  var techs = $$(".tech");
  if (techs.length && cards.length) {
    var pop = document.createElement("div");
    pop.className = "tech-pop";
    pop.setAttribute("role", "tooltip");
    document.body.appendChild(pop);
    var norm = function (s) { return s.toLowerCase().replace(/\s+/g, " ").trim(); };
    techs.forEach(function (t) {
      var name = norm(t.textContent);
      var used = cards.filter(function (c) {
        return (c.getAttribute("data-stack") || "").split("|").map(norm).indexOf(name) >= 0;
      }).map(function (c) { return $(".card__title", c).textContent; });
      if (!used.length) return;
      var label = T.usedIn + " " + used.length + " " + (used.length > 1 ? T.projects : T.project);
      t.setAttribute("data-n", used.length);
      t.setAttribute("tabindex", "0");
      t.setAttribute("aria-label", t.textContent + " — " + label + " : " + used.join(", "));
      var show = function () {
        pop.innerHTML = "<b>" + label + "</b><ul>" + used.map(function (u) { return "<li>" + u + "</li>"; }).join("") + "</ul>";
        var r = t.getBoundingClientRect();
        pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 300)) + "px";
        pop.style.top = (r.bottom + 8) + "px";
        pop.classList.add("on");
      };
      var hide = function () { pop.classList.remove("on"); };
      t.addEventListener("pointerenter", show);
      t.addEventListener("pointerleave", hide);
      t.addEventListener("focus", show);
      t.addEventListener("blur", hide);
    });
    window.addEventListener("scroll", function () { pop.classList.remove("on"); }, { passive: true });
  }

  /* ================================================================ copier l'e-mail, toast */

  var toast = $(".toast");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("on"); }, 2200);
  }
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(b.getAttribute("data-copy")).then(function () {
        b.textContent = T.copyDone; b.classList.add("done");
        showToast(T.copied);
        setTimeout(function () { b.textContent = T.copy; b.classList.remove("done"); }, 2000);
      }, function () {});
    });
  });

  /* ================================================================ terminal */

  var term = $(".term");
  if (!term) return;
  var out = $(".term__out", term);
  var input = $(".term__in", term);
  var form = $(".term__line", term);
  var lastFocus = null;
  var hist = [], hi = 0;
  var booted = false;

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var print = function (html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  };
  var base = EN ? "/en" : "";

  var projects = function () {
    return cards.map(function (c) {
      return { slug: c.getAttribute("data-slug"), cat: c.getAttribute("data-cat"),
               title: $(".card__title", c).textContent, tag: $(".card__tag", c).textContent,
               href: $(".card__title a", c).getAttribute("href") };
    });
  };

  var S = EN ? {
    welcome: 'Welcome to <span class="b">tom@giles</span> — interactive shell.\nType <span class="c">help</span> to list commands. <span class="g">Tab completes, ↑/↓ browse history, Esc closes.</span>',
    help: [["whoami", "who am I"], ["projects", "list projects"], ["open &lt;slug&gt;", "open a project page"],
      ["incidents", "production post-mortems"], ["stack", "tools I use"], ["kubectl get nodes|pods", "live cluster state"],
      ["contact", "how to reach me"], ["linkedin", "open my LinkedIn"], ["cv", "download my resume"],
      ["cd &lt;section&gt;", "jump to a section"], ["neofetch", "system summary"], ["clear", "clear screen"], ["exit", "close terminal"]],
    who: "Tom Giles — engineering student at EPITA (SIGL, class of 2027).\nProduct Owner of SIOPS, the SRE team running a production RKE2 cluster on OpenStack.\n<span class=\"c\">Looking for a 6-month pre-hire internship from February 2027</span> — Platform / Cloud / SRE / DevOps.",
    notFound: function (c) { return '<span class="r">command not found:</span> ' + esc(c) + ' — type <span class="c">help</span>'; },
    noProject: function (s) { return '<span class="r">no such project:</span> ' + esc(s) + ' — try <span class="c">projects</span>'; },
    opening: "opening", usage: "usage", hire: "Permission granted. Redirecting to my inbox… 🚀",
    rm: '<span class="r">rm: refusing to remove "/"</span> — I write post-mortems, not incidents.',
    incidents: ["INC-01 SEV1  etcd OOM-killed → control plane deadlock at restart", "INC-02 SEV1  3 weeks without backups while jobs were green (486 → 48 GiB)", "INC-03 SEV2  Vault auto-unseal depends on a single-replica Vault (SPOF)"],
    contact: "email     tom.giles@epita.fr\nphone     +33 6 95 10 40 56\nlinkedin  <a href=\"https://www.linkedin.com/in/giles-tom/\" target=\"_blank\" rel=\"noopener\">in/giles-tom</a>\nplace     Paris / Vosges — mobile",
    themeSet: "dark. always dark.", sections: "projects  incidents  parcours  stack  contact", secMap: { projects: "projets", timeline: "parcours", career: "parcours" }
  } : {
    welcome: 'Bienvenue sur <span class="b">tom@giles</span> — shell interactif.\nTapez <span class="c">help</span> pour la liste des commandes. <span class="g">Tab complète, ↑/↓ historique, Échap ferme.</span>',
    help: [["whoami", "qui suis-je"], ["projects", "liste des projets"], ["open &lt;slug&gt;", "ouvre la page d'un projet"],
      ["incidents", "post-mortems de production"], ["stack", "mes outils"], ["kubectl get nodes|pods", "état du cluster en direct"],
      ["contact", "me joindre"], ["linkedin", "ouvrir mon LinkedIn"], ["cv", "télécharger le CV"],
      ["cd &lt;section&gt;", "aller à une section"], ["neofetch", "résumé système"], ["clear", "effacer l'écran"], ["exit", "fermer le terminal"]],
    who: "Tom Giles — étudiant-ingénieur à l'EPITA (majeure SIGL, promo 2027).\nProduct Owner de SIOPS, l'équipe SRE qui opère un cluster RKE2 de production sur OpenStack.\n<span class=\"c\">Cherche un stage de pré-embauche de 6 mois dès février 2027</span> — Platform / Cloud / SRE / DevOps.",
    notFound: function (c) { return '<span class="r">commande introuvable :</span> ' + esc(c) + ' — tapez <span class="c">help</span>'; },
    noProject: function (s) { return '<span class="r">projet inconnu :</span> ' + esc(s) + ' — essayez <span class="c">projects</span>'; },
    opening: "ouverture de", usage: "usage", hire: "Permission accordée. Redirection vers ma boîte mail… 🚀",
    rm: '<span class="r">rm : suppression de « / » refusée</span> — j\'écris des post-mortems, pas des incidents.',
    incidents: ["INC-01 SEV1  etcd tué par l'OOM killer → interblocage du control plane", "INC-02 SEV1  3 semaines sans sauvegarde, jobs verts (486 → 48 GiB)", "INC-03 SEV2  auto-unseal Vault dépendant d'un Vault en réplique unique (SPOF)"],
    contact: "mail      tom.giles@epita.fr\ntél.      06 95 10 40 56\nlinkedin  <a href=\"https://www.linkedin.com/in/giles-tom/\" target=\"_blank\" rel=\"noopener\">in/giles-tom</a>\nlieu      Paris / Vosges — mobile",
    themeSet: "sombre. toujours sombre.", sections: "projets  incidents  parcours  stack  contact", secMap: { projects: "projets", timeline: "parcours", career: "parcours" }
  };

  var COMMANDS = ["help", "whoami", "about", "projects", "ls", "open", "cat", "incidents", "stack", "kubectl", "contact", "email", "cv",
    "theme", "linkedin", "cd", "neofetch", "clear", "exit", "date", "echo", "uname", "sudo", "history", "pwd", "hire"];

  var go = function (href) { setTimeout(function () { close(); location.href = href; }, 450); };

  var run = function (line) {
    var raw = line.trim();
    print('<span class="c">tom@giles:~$</span> ' + esc(raw));
    if (!raw) return;
    hist.push(raw); hi = hist.length;
    var parts = raw.split(/\s+/), cmd = parts[0].toLowerCase(), args = parts.slice(1);
    var arg = (args[0] || "").toLowerCase();

    switch (cmd) {
      case "help":
        print(S.help.map(function (h) {
          var plain = h[0].replace(/&lt;/g, "<").replace(/&gt;/g, ">");
          return '  <span class="c">' + h[0] + "</span>" + new Array(Math.max(2, 26 - plain.length)).join(" ") + h[1];
        }).join("\n"));
        break;
      case "whoami": case "about":
        print(S.who); break;
      case "ls":
        if (arg !== "projects" && arg !== "projets") { print('<span class="m">' + S.sections.split("  ").join("/  ") + "/</span>"); break; }
        /* fallthrough */
      case "projects":
        print(projects().map(function (p) {
          return '  <span class="c">' + (p.slug + "            ").slice(0, 12) + '</span><span class="g">' + (p.cat + "            ").slice(0, 12) + "</span>" + esc(p.title);
        }).join("\n") + '\n<span class="g">→ open &lt;slug&gt;</span>');
        break;
      case "open": case "cat":
        if (!arg) { print(S.usage + ": " + cmd + " &lt;slug&gt;"); break; }
        var p = projects().find(function (x) { return x.slug === arg || x.slug.indexOf(arg) === 0; });
        if (!p) { print(S.noProject(arg)); break; }
        if (cmd === "cat") { print('<span class="b">' + esc(p.title) + "</span>\n" + esc(p.tag) + '\n<a href="' + p.href + '">' + p.href + "</a>"); break; }
        print(S.opening + ' <a href="' + p.href + '">' + p.href + "</a> …");
        go(p.href);
        break;
      case "incidents":
        print(S.incidents.map(function (l) { return (l.indexOf("SEV1") > 0 ? '<span class="r">●</span> ' : '<span class="y">●</span> ') + esc(l); }).join("\n"));
        break;
      case "stack":
        print($$(".stack__group").map(function (g) {
          return '<span class="m">' + esc($(".stack__name", g).textContent) + "</span>\n  " + $$(".tech", g).map(function (t) { return esc(t.textContent); }).join(" · ");
        }).join("\n"));
        break;
      case "kubectl":
        if (args[0] === "get" && /^(nodes?|no)$/.test(args[1] || "")) {
          print('<span class="g">NAME       STATUS   ROLES                  PODS   VERSION</span>\n' + cluster.nodes.map(function (n) {
            return (n.name + "   ").slice(0, 11) + '<span class="c">Ready</span>    ' + (n.master ? "control-plane,etcd     " : "worker                 ") + (n.pods.length + "/" + CAP + "    ").slice(0, 7) + "v1.32";
          }).join("\n"));
        } else if (args[0] === "get" && /^(pods?|po)$/.test(args[1] || "")) {
          var rows = [];
          cluster.nodes.forEach(function (n) { n.pods.forEach(function (pd) { rows.push([pd, n]); }); });
          print('<span class="g">NAME                          STATUS              NODE</span>\n' + rows.slice(0, 18).map(function (r) {
            var st = r[0].state === "run" ? '<span class="c">Running</span>            ' : r[0].state === "bad" ? '<span class="r">OOMKilled</span>          ' : r[0].state === "pend" ? '<span class="y">ContainerCreating</span>  ' : '<span class="g">Terminating</span>        ';
            return (r[0].name + "                              ").slice(0, 30) + st + r[1].name;
          }).join("\n") + (rows.length > 18 ? '\n<span class="g">… ' + (rows.length - 18) + " more</span>" : ""));
        } else {
          print(S.usage + ": kubectl get nodes | kubectl get pods");
        }
        break;
      case "contact": case "email":
        print(S.contact); break;
      case "linkedin":
        print(S.opening + ' <a href="https://www.linkedin.com/in/giles-tom/" target="_blank" rel="noopener">linkedin.com/in/giles-tom</a> …');
        window.open("https://www.linkedin.com/in/giles-tom/", "_blank", "noopener");
        break;
      case "cv":
        print(S.opening + ' <a href="/cv/tom-giles-cv' + (EN ? "-en" : "") + '.pdf">cv.pdf</a> …');
        go("/cv/tom-giles-cv" + (EN ? "-en" : "") + ".pdf");
        break;
      case "theme":
        print(S.themeSet); break;
      case "cd":
        var sec = S.secMap[arg] || arg.replace(/\/$/, "");
        var el = sec && $("#" + sec);
        if (!el || !/^(projets|incidents|parcours|stack|contact|manifeste)$/.test(sec)) { print(S.usage + ": cd " + S.sections.split("  ").join(" | ")); break; }
        close(); el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        break;
      case "neofetch":
        var np = 0; cluster.nodes.forEach(function (n) { np += n.pods.length; });
        var art = ["   /\\      ", "  /  \\     ", " /\\   \\    ", "/  __  \\   ", "/ (  )  \\  ", "/ __|  |__\\", "/.`      `.\\"];
        var info = ['<span class="c">tom</span>@<span class="c">giles</span>', "----------", "<span class=\"c\">OS</span>: Arch Linux", "<span class=\"c\">Role</span>: Platform / SRE / PO",
          "<span class=\"c\">School</span>: EPITA SIGL 2027", "<span class=\"c\">Cluster</span>: RKE2 v1.32 · 6 nodes · " + np + " pods", "<span class=\"c\">Uptime</span>: " + (EN ? "since 2022" : "depuis 2022")];
        print(art.map(function (a, i) { return '<span class="c">' + esc(a) + "</span>  " + (info[i] || ""); }).join("\n"));
        break;
      case "date": print(new Date().toString()); break;
      case "pwd": print("/home/tom"); break;
      case "echo": print(esc(args.join(" "))); break;
      case "uname": print("Linux giles 6.x-arch1 x86_64 GNU/Linux"); break;
      case "history": print(hist.map(function (h, i) { return "  " + (i + 1) + "  " + esc(h); }).join("\n")); break;
      case "clear": out.innerHTML = ""; break;
      case "exit": case "quit": close(); break;
      case "hire":
        print('<span class="c">' + S.hire + "</span>");
        go("mailto:tom.giles@epita.fr");
        break;
      case "sudo":
        if (/rm/.test(args.join(" "))) { print(S.rm); break; }
        if (/hire/.test(args.join(" "))) { print('<span class="c">' + S.hire + "</span>"); go("mailto:tom.giles@epita.fr"); break; }
        print("[sudo] " + (EN ? "nice try." : "bien essayé.")); break;
      case "rm":
        print(S.rm); break;
      default:
        print(S.notFound(cmd));
    }
  };

  var open = function () {
    lastFocus = document.activeElement;
    term.classList.add("open");
    document.body.style.overflow = "hidden";
    if (!booted) {
      booted = true;
      print(S.welcome);
      print("");
    }
    setTimeout(function () { input.focus(); }, 60);
  };
  var close = function () {
    term.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  $$("[data-term-open]").forEach(function (b) { b.addEventListener("click", open); });
  $(".term__close", term).addEventListener("click", close);
  term.addEventListener("click", function (e) { if (e.target === term) close(); });
  $(".term__win", term).addEventListener("click", function (e) {
    if (!window.getSelection().toString() && e.target.tagName !== "A") input.focus();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = "";
    run(v);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hi > 0) { hi--; input.value = hist[hi]; }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hi < hist.length - 1) { hi++; input.value = hist[hi]; } else { hi = hist.length; input.value = ""; }
    } else if (e.key === "Tab") {
      e.preventDefault();
      var v = input.value, parts = v.split(/\s+/);
      var pool, cur;
      if (parts.length <= 1) { pool = COMMANDS; cur = parts[0]; }
      else if (/^(open|cat)$/.test(parts[0])) { pool = projects().map(function (p) { return p.slug; }); cur = parts[1]; }
      else if (parts[0] === "cd") { pool = ["projets", "incidents", "parcours", "stack", "contact"]; cur = parts[1]; }
      else if (parts[0] === "kubectl") { pool = ["get nodes", "get pods"]; cur = parts.slice(1).join(" "); parts = [parts[0], cur]; }
      else return;
      var m = pool.filter(function (x) { return x.indexOf(cur) === 0; });
      if (m.length === 1) { parts[parts.length - 1] = m[0]; input.value = parts.join(" ") + " "; }
      else if (m.length > 1) print('<span class="g">' + m.join("  ") + "</span>");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault(); out.innerHTML = "";
    }
  });

  document.addEventListener("keydown", function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (e.key === "Escape" && term.classList.contains("open")) { e.preventDefault(); close(); return; }
    if (term.classList.contains("open")) {
      // piège de focus minimal : le terminal n'a qu'un champ et un bouton
      if (e.key === "Tab" && document.activeElement !== input) { e.preventDefault(); input.focus(); }
      return;
    }
    if (typing) return;
    if (e.key === "/" || e.key === "`" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
      e.preventDefault();
      open();
    }
  });
})();
