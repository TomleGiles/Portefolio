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

    /* rendu 3D fait main : projection perspective sur un canvas 2D, pas de WebGL ni de dépendance.
       Les nœuds sont des prismes hexagonaux posés en anneau ; la caméra tourne lentement,
       suit le pointeur et plonge au scroll. */
    var R = 1, F = 1, D = 1, CX = 0, CY = 0, FLOOR = 0;
    var cam = { mx: 0, my: 0, cy: 1, sy: 0, cp: 1, sp: 0, dist: 1 };

    var layout = function () {
      var r = hero.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      var wide = W > 900;
      R = wide ? Math.min(W * .36, 560) : Math.min(W * .62, 300);
      D = F = R * 2.6;
      CX = W * .5; CY = H * .48;
      FLOOR = R * .42;
      // masters et workers alternés sur l'anneau
      var ANG = [90, 210, 330, 30, 150, 270];
      cluster.nodes.forEach(function (n, i) {
        var a = ANG[i] * Math.PI / 180;
        n.wx = Math.cos(a) * R;
        n.wz = Math.sin(a) * R;
        n.seed = n.seed || rand(0, 1000);
      });
      canvas.style.opacity = wide ? 1 : .4;
    };

    var project = function (x, y, z) {
      var x1 = x * cam.cy - z * cam.sy, z1 = x * cam.sy + z * cam.cy;
      var y2 = y * cam.cp - z1 * cam.sp, z2 = y * cam.sp + z1 * cam.cp;
      var s = F / Math.max(z2 + cam.dist, 10);
      return { x: CX + x1 * s, y: CY + y2 * s, s: s, z: z2 };
    };
    // brouillard : ce qui est loin s'estompe
    var fog = function (z) { return clamp(1 - z / R * .4, .3, 1); };

    var rgba = function (hex, a) {
      if (!hex) return "rgba(0,0,0," + a + ")";
      if (hex.indexOf("rgb") === 0) return hex;
      var h = hex.replace("#", "");
      if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
      var n = parseInt(h, 16);
      return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")";
    };

    var poly = function (pts) {
      ctx.beginPath();
      pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
      ctx.closePath();
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

    var HEX = [];
    for (var hk = 0; hk < 6; hk++) HEX.push(Math.PI / 3 * hk);

    var drawNode = function (n, t) {
      var col = n.master ? C.accent2 : C.accent;
      var q = n.p, f = fog(q.z), r = 16, h = 7;
      var g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, 46 * q.s);
      g.addColorStop(0, rgba(col, .32 * f)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, 46 * q.s, 0, Math.PI * 2); ctx.fill();

      // prisme hexagonal : faces latérales du fond vers l'avant, puis le dessus
      var top = [], bot = [];
      HEX.forEach(function (a) {
        var x = n.x3 + Math.cos(a) * r, z = n.z3 + Math.sin(a) * r;
        top.push(project(x, n.y3 - h, z));
        bot.push(project(x, n.y3 + h, z));
      });
      var sides = [];
      for (var k = 0; k < 6; k++) {
        var k2 = (k + 1) % 6;
        sides.push({ pts: [top[k], top[k2], bot[k2], bot[k]], z: (top[k].z + top[k2].z) / 2 });
      }
      sides.sort(function (a, b) { return b.z - a.z; });
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = rgba(col, .85 * f);
      sides.forEach(function (sd) {
        poly(sd.pts);
        ctx.fillStyle = C.bg || "#000"; ctx.fill();
        ctx.fillStyle = rgba(col, .1); ctx.fill();
        ctx.stroke();
      });
      poly(top);
      ctx.fillStyle = C.bg || "#000"; ctx.fill();
      ctx.fillStyle = rgba(col, n.hot ? .5 : .22 + Math.sin(t * .003 + n.seed) * .06); ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 1;

      ctx.fillStyle = rgba(n.hot ? col : C.ink3, n.hot ? 1 : .9 * f);
      ctx.font = "500 10px 'Geist Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(n.hot ? n.name + " · " + n.pods.length + " pods" : n.name, q.x, q.y + 38 * q.s + 14);
    };

    var drawPod = function (it) {
      var n = it.n, p = it.p, q = it.q, f = fog(q.z);
      var col = n.master ? C.accent2 : C.accent;
      var c = p.state === "bad" ? C.danger : p.state === "pend" ? C.warn : col;
      ctx.strokeStyle = rgba(c, .14 * p.life * f);
      ctx.beginPath(); ctx.moveTo(n.p.x, n.p.y); ctx.lineTo(p.sx, p.sy); ctx.stroke();
      ctx.fillStyle = rgba(c, p.life * f);
      ctx.beginPath(); ctx.arc(p.sx, p.sy, (p.state === "bad" ? 4 : 3) * q.s, 0, Math.PI * 2); ctx.fill();
      if (p.state === "pend") {
        ctx.strokeStyle = rgba(c, .6 * f);
        ctx.beginPath(); ctx.arc(p.sx, p.sy, (6 + Math.sin(it.t * .01) * 1.5) * q.s, 0, Math.PI * 2); ctx.stroke();
      }
    };

    var drawPacket = function (it) {
      var q = it.q, c = it.pk.color, rr = 16 * q.s;
      var g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rr);
      g.addColorStop(0, rgba(c, .9)); g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, rr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(q.x, q.y, 2.5 * q.s, 0, Math.PI * 2); ctx.fill();
    };

    var draw = function (t) {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // caméra : rotation lente + parallaxe du pointeur + plongée au scroll
      var sc = reduced ? 0 : clamp(window.scrollY / Math.max(H, 1), 0, 1);
      cam.mx += ((mouse.active ? mouse.x / W - .5 : 0) - cam.mx) * .04;
      cam.my += ((mouse.active ? mouse.y / H - .5 : 0) - cam.my) * .04;
      var yaw = (reduced ? .5 : t * .00005) + cam.mx * .8;
      var pitch = .42 + cam.my * .3 + sc * .35;
      cam.cy = Math.cos(yaw); cam.sy = Math.sin(yaw);
      cam.cp = Math.cos(pitch); cam.sp = Math.sin(pitch);
      cam.dist = D * (1 + sc * .25);

      cluster.nodes.forEach(function (n) {
        n.x3 = n.wx;
        n.z3 = n.wz;
        n.y3 = reduced ? 0 : Math.sin(t * .0006 + n.seed) * R * .035;
        n.p = project(n.x3, n.y3, n.z3);
        n.x = n.p.x; n.y = n.p.y;
        var dx = n.x - mouse.x, dy = n.y - mouse.y;
        n.hot = mouse.active && dx * dx + dy * dy < 900;
      });

      // sol : anneaux et rayons en perspective
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(C.ink3, .12);
      [.45, .8, 1.2, 1.7].forEach(function (k) {
        ctx.beginPath();
        for (var i = 0; i <= 72; i++) {
          var a = i / 72 * Math.PI * 2, p = project(Math.cos(a) * R * k, FLOOR, Math.sin(a) * R * k);
          if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
        }
        ctx.stroke();
      });
      ctx.strokeStyle = rgba(C.ink3, .07);
      for (var sI = 0; sI < 12; sI++) {
        var sa = sI / 12 * Math.PI * 2;
        var p0 = project(Math.cos(sa) * R * .45, FLOOR, Math.sin(sa) * R * .45);
        var p1 = project(Math.cos(sa) * R * 1.7, FLOOR, Math.sin(sa) * R * 1.7);
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      }

      // ombres portées + fil vers le sol
      cluster.nodes.forEach(function (n) {
        var col = n.master ? C.accent2 : C.accent, f = fog(n.p.z);
        var s = project(n.x3, FLOOR, n.z3);
        ctx.fillStyle = rgba(col, .1 * f);
        ctx.beginPath(); ctx.ellipse(s.x, s.y, 26 * s.s, 26 * s.s * cam.sp, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = rgba(col, .2 * f);
        ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(n.p.x, n.p.y); ctx.lineTo(s.x, s.y); ctx.stroke();
        ctx.setLineDash([]);
      });

      // arêtes
      edges.forEach(function (e) {
        var both = e[0].master && e[1].master, f = fog((e[0].p.z + e[1].p.z) / 2);
        ctx.strokeStyle = rgba(both ? C.accent2 : C.ink3, (both ? .4 : .16) * f);
        ctx.setLineDash(both ? [] : [3, 6]);
        ctx.beginPath(); ctx.moveTo(e[0].p.x, e[0].p.y); ctx.lineTo(e[1].p.x, e[1].p.y); ctx.stroke();
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

      // tout ce qui a une profondeur est trié du fond vers l'avant
      var items = [];
      cluster.nodes.forEach(function (n) {
        items.push({ z: n.p.z, k: 0, n: n });
        n.pods.forEach(function (p) {
          if (p.state === "run" || p.state === "bad") p.life = Math.min(1, p.life + .04);
          else if (p.state === "pend") p.life = Math.min(.6, p.life + .02);
          else if (p.state === "dying") p.life = Math.max(0, p.life - .05);
          if (p.inc === undefined) p.inc = rand(-1.1, 1.1);
          var a = p.angle + t * p.speed * 3, o = p.orbit * .9;
          var q = project(n.x3 + Math.cos(a) * o, n.y3 + Math.sin(a) * o * Math.sin(p.inc), n.z3 + Math.sin(a) * o * Math.cos(p.inc));
          p.sx = q.x; p.sy = q.y;
          if (mouse.active) {
            var dx = q.x - mouse.x, dy = q.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < 110 && d > 0) { var fr = (110 - d) / 110 * 16; p.sx += dx / d * fr; p.sy += dy / d * fr; }
          }
          items.push({ z: q.z, k: 1, n: n, p: p, q: q, t: t });
        });
      });
      packets = packets.filter(function (pk) {
        pk.t += pk.speed;
        if (pk.t >= 1) return false;
        // arc de Bézier qui passe au-dessus de l'anneau
        var e = pk.t < .5 ? 2 * pk.t * pk.t : 1 - Math.pow(-2 * pk.t + 2, 2) / 2, u = 1 - e;
        var a = pk.from, b = pk.to;
        var mx = (a.x3 + b.x3) / 2, my = (a.y3 + b.y3) / 2 - R * .35, mz = (a.z3 + b.z3) / 2;
        var q = project(u * u * a.x3 + 2 * u * e * mx + e * e * b.x3,
                        u * u * a.y3 + 2 * u * e * my + e * e * b.y3,
                        u * u * a.z3 + 2 * u * e * mz + e * e * b.z3);
        items.push({ z: q.z, k: 2, pk: pk, q: q });
        return true;
      });
      items.sort(function (a, b) { return b.z - a.z; });
      items.forEach(function (it) {
        if (it.k === 0) drawNode(it.n, t);
        else if (it.k === 1) drawPod(it);
        else drawPacket(it);
      });

      // étincelles d'échec
      sparks = sparks.filter(function (s) {
        s.t += .02;
        if (s.t >= 1 || s.pod.sx === undefined) return false;
        ctx.strokeStyle = rgba(C.danger, 1 - s.t);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(s.pod.sx, s.pod.sy, 4 + s.t * 26, 0, Math.PI * 2); ctx.stroke();
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

  /* ================================================================ produit : pipeline validé étape par étape
     Chaque tuile qui entre à l'écran valide son étape ; toutes validées → pipeline vert. */

  var pipe = $("[data-pipeline]");
  if (pipe) {
    var stages = $$(".pipeline__stages li", pipe);
    var rail = $(".pipeline__stages", pipe);
    var label = $(".pipeline__head span", pipe);
    var passed = -1;
    var validate = function (k) {
      if (k <= passed) return;
      passed = k;
      stages.forEach(function (li, i) { li.classList.toggle("lit", i <= k); });
      rail.style.setProperty("--fill", stages.length > 1 ? (k / (stages.length - 1)).toFixed(3) : 1);
      if (k >= stages.length - 1) {
        pipe.classList.add("done");
        label.textContent = pipe.getAttribute("data-done");
      }
    };
    var tiles = $$(".pm[data-stage]");
    // étape en cours : la tuile qui traverse le milieu de l'écran
    if ("IntersectionObserver" in window) {
      var curObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var k = parseInt(e.target.getAttribute("data-stage"), 10);
          stages.forEach(function (li, i) { li.classList.toggle("cur", i === k); });
        });
      }, { rootMargin: "-45% 0px -45% 0px" });
      tiles.forEach(function (el) { curObs.observe(el); });
    }
    // une étape touchée valide tout ce qui la précède
    stages.forEach(function (li, i) {
      $("a", li).addEventListener("click", function () { validate(i); });
    });
    if (reduced || !("IntersectionObserver" in window)) validate(stages.length - 1);
    else {
      var pmObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          validate(parseInt(e.target.getAttribute("data-stage"), 10));
          pmObs.unobserve(e.target);
        });
      }, { threshold: .6 });
      tiles.forEach(function (el) { pmObs.observe(el); });
    }
    tiles.forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ================================================================ cartes : halo sous le pointeur */

  var tilt = finePointer && !reduced;
  $$(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
      // inclinaison 3D : la carte « regarde » le pointeur
      if (tilt) {
        card.style.setProperty("--ry", ((x / r.width - .5) * 10).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((.5 - y / r.height) * 8).toFixed(2) + "deg");
      }
    });
    if (tilt) card.addEventListener("pointerleave", function () {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
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

  /* ================================================================ fluide WebGL (section chiffres)
     Stable fluids (Stam) sur GPU : advection, vorticité, projection de pression par Jacobi.
     Le pointeur remue l'encre ; chaque changement de chiffre provoque une éclaboussure.
     Absent en mouvement réduit ou si le GPU ne sait pas rendre en flottants filtrés. */

  var fluid = null;
  (function () {
    var sticky = $(".numbers__sticky");
    if (!sticky || reduced) return;
    var cv = document.createElement("canvas");
    cv.className = "numbers__fluid";
    cv.setAttribute("aria-hidden", "true");
    sticky.insertBefore(cv, sticky.firstChild);

    var opts = { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: false };
    var gl = cv.getContext("webgl2", opts), gl2 = !!gl;
    if (!gl) gl = cv.getContext("webgl", opts) || cv.getContext("experimental-webgl", opts);
    if (!gl) { cv.remove(); return; }

    var fmt;
    if (gl2) {
      if (!gl.getExtension("EXT_color_buffer_float")) { cv.remove(); return; }
      fmt = { internal: gl.RGBA16F, format: gl.RGBA, type: gl.HALF_FLOAT };
    } else {
      var hf = gl.getExtension("OES_texture_half_float");
      if (!hf || !gl.getExtension("OES_texture_half_float_linear")) { cv.remove(); return; }
      fmt = { internal: gl.RGBA, format: gl.RGBA, type: hf.HALF_FLOAT_OES };
    }

    var VS = "precision highp float;attribute vec2 aPos;uniform vec2 texel;varying vec2 vUv,vL,vR,vT,vB;" +
      "void main(){vUv=aPos*.5+.5;vL=vUv-vec2(texel.x,0.);vR=vUv+vec2(texel.x,0.);vT=vUv+vec2(0.,texel.y);vB=vUv-vec2(0.,texel.y);gl_Position=vec4(aPos,0.,1.);}";
    var HEAD = "precision highp float;precision highp sampler2D;varying vec2 vUv,vL,vR,vT,vB;";
    var FS = {
      splat: "uniform sampler2D uTarget;uniform float aspect,radius;uniform vec3 color;uniform vec2 point;" +
        "void main(){vec2 p=vUv-point;p.x*=aspect;gl_FragColor=vec4(texture2D(uTarget,vUv).xyz+exp(-dot(p,p)/radius)*color,1.);}",
      advect: "uniform sampler2D uVelocity,uSource;uniform vec2 simTexel;uniform float dt,dissipation;" +
        "void main(){vec2 c=vUv-dt*texture2D(uVelocity,vUv).xy*simTexel;gl_FragColor=texture2D(uSource,c)/(1.+dissipation*dt);}",
      divergence: "uniform sampler2D uVelocity;" +
        "void main(){float L=texture2D(uVelocity,vL).x,R=texture2D(uVelocity,vR).x,T=texture2D(uVelocity,vT).y,B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;" +
        "if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);}",
      curl: "uniform sampler2D uVelocity;" +
        "void main(){gl_FragColor=vec4(.5*(texture2D(uVelocity,vR).y-texture2D(uVelocity,vL).y-texture2D(uVelocity,vT).x+texture2D(uVelocity,vB).x),0.,0.,1.);}",
      vorticity: "uniform sampler2D uVelocity,uCurl;uniform float curl,dt;" +
        "void main(){float L=texture2D(uCurl,vL).x,R=texture2D(uCurl,vR).x,T=texture2D(uCurl,vT).x,B=texture2D(uCurl,vB).x,C=texture2D(uCurl,vUv).x;" +
        "vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+.0001;f*=curl*C;f.y*=-1.;" +
        "vec2 v=texture2D(uVelocity,vUv).xy+f*dt;gl_FragColor=vec4(clamp(v,-1000.,1000.),0.,1.);}",
      pressure: "uniform sampler2D uPressure,uDivergence;" +
        "void main(){gl_FragColor=vec4((texture2D(uPressure,vL).x+texture2D(uPressure,vR).x+texture2D(uPressure,vB).x+texture2D(uPressure,vT).x-texture2D(uDivergence,vUv).x)*.25,0.,0.,1.);}",
      gradient: "uniform sampler2D uPressure,uVelocity;" +
        "void main(){vec2 v=texture2D(uVelocity,vUv).xy-vec2(texture2D(uPressure,vR).x-texture2D(uPressure,vL).x,texture2D(uPressure,vT).x-texture2D(uPressure,vB).x);gl_FragColor=vec4(v,0.,1.);}",
      clear: "uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}",
      // relief : normale tirée du gradient d'encre, éclairage diffus + reflet spéculaire,
      // puis courbe de tons douce (relief lisible sans creux noirs ni crêtes brûlées)
      display: "uniform sampler2D uTexture;" +
        "void main(){vec3 c=texture2D(uTexture,vUv).rgb;" +
        "float dx=length(texture2D(uTexture,vR).rgb)-length(texture2D(uTexture,vL).rgb);" +
        "float dy=length(texture2D(uTexture,vT).rgb)-length(texture2D(uTexture,vB).rgb);" +
        "vec3 n=normalize(vec3(dx,dy,.07));vec3 l=normalize(vec3(-.45,.55,1.));" +
        "float dif=clamp(dot(n,l)+.4,.65,1.1);float sp=pow(max(dot(reflect(-l,n),vec3(0.,0.,1.)),0.),28.);" +
        "c=c/(1.+c);c=pow(c,vec3(.9))*1.15*dif+sp*.28*vec3(.8,1.,1.);" +
        "float m=max(c.r,max(c.g,c.b));float a=smoothstep(0.,.55,m)*.85;gl_FragColor=vec4(min(c,vec3(a)),a);}"
    };

    var compile = function (type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    var vs = compile(gl.VERTEX_SHADER, VS);
    var P = {}, ok = !!vs;
    Object.keys(FS).forEach(function (k) {
      if (!ok) return;
      var fs = compile(gl.FRAGMENT_SHADER, HEAD + FS[k]);
      if (!fs) { ok = false; return; }
      var pr = gl.createProgram();
      gl.attachShader(pr, vs); gl.attachShader(pr, fs);
      gl.bindAttribLocation(pr, 0, "aPos");
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { ok = false; return; }
      var u = {}, n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < n; i++) { var nm = gl.getActiveUniform(pr, i).name; u[nm] = gl.getUniformLocation(pr, nm); }
      P[k] = { pr: pr, u: u };
    });
    if (!ok) { cv.remove(); return; }

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    var fbo = function (w, h) {
      gl.activeTexture(gl.TEXTURE0);
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internal, w, h, 0, fmt.format, fmt.type, null);
      var fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex: tex, fb: fb, w: w, h: h, complete: gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE,
               attach: function (unit) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); return unit; } };
    };
    var dbl = function (w, h) {
      var a = fbo(w, h), b = fbo(w, h);
      return { get read() { return a; }, get write() { return b; }, swap: function () { var t = a; a = b; b = t; } };
    };
    var dispose = function (f) { gl.deleteTexture(f.tex); gl.deleteFramebuffer(f.fb); };

    var vel, dye, pres, div, curlT, simW, simH;
    var size = function (base) {
      var ar = cv.width / cv.height;
      return ar > 1 ? [Math.round(base * ar), base] : [base, Math.round(base / ar)];
    };
    var init = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.max(1, Math.round(sticky.clientWidth * dpr));
      cv.height = Math.max(1, Math.round(sticky.clientHeight * dpr));
      [vel, dye, pres].forEach(function (d) { if (d) { dispose(d.read); dispose(d.write); } });
      [div, curlT].forEach(function (f) { if (f) dispose(f); });
      var s = size(112), d = size(window.innerWidth > 900 ? 512 : 256);
      simW = s[0]; simH = s[1];
      vel = dbl(simW, simH); pres = dbl(simW, simH);
      div = fbo(simW, simH); curlT = fbo(simW, simH);
      dye = dbl(d[0], d[1]);
      return vel.read.complete && dye.read.complete;
    };
    if (!init()) { cv.remove(); return; }

    var blit = function (target) {
      if (target) { gl.viewport(0, 0, target.w, target.h); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb); }
      else { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
    var use = function (p, tw, th) {
      gl.useProgram(p.pr);
      if (p.u.texel) gl.uniform2f(p.u.texel, 1 / tw, 1 / th);
      return p.u;
    };

    var splat = function (x, y, dx, dy, color, radius) {
      var ar = cv.width / cv.height, rad = (radius || .0025) * (ar > 1 ? ar : 1);
      var u = use(P.splat, simW, simH);
      gl.uniform1i(u.uTarget, vel.read.attach(0));
      gl.uniform1f(u.aspect, ar); gl.uniform1f(u.radius, rad);
      gl.uniform2f(u.point, x, y);
      gl.uniform3f(u.color, dx, dy, 0);
      blit(vel.write); vel.swap();
      gl.uniform1i(u.uTarget, dye.read.attach(0));
      gl.uniform3f(u.color, color[0], color[1], color[2]);
      blit(dye.write); dye.swap();
    };

    var step = function (dt) {
      gl.disable(gl.BLEND);
      var u = use(P.curl, simW, simH);
      gl.uniform1i(u.uVelocity, vel.read.attach(0)); blit(curlT);

      u = use(P.vorticity, simW, simH);
      gl.uniform1i(u.uVelocity, vel.read.attach(0)); gl.uniform1i(u.uCurl, curlT.attach(1));
      gl.uniform1f(u.curl, 22); gl.uniform1f(u.dt, dt);
      blit(vel.write); vel.swap();

      u = use(P.divergence, simW, simH);
      gl.uniform1i(u.uVelocity, vel.read.attach(0)); blit(div);

      u = use(P.clear, simW, simH);
      gl.uniform1i(u.uTexture, pres.read.attach(0)); gl.uniform1f(u.value, .8);
      blit(pres.write); pres.swap();

      u = use(P.pressure, simW, simH);
      gl.uniform1i(u.uDivergence, div.attach(0));
      for (var i = 0; i < 20; i++) { gl.uniform1i(u.uPressure, pres.read.attach(1)); blit(pres.write); pres.swap(); }

      u = use(P.gradient, simW, simH);
      gl.uniform1i(u.uPressure, pres.read.attach(0)); gl.uniform1i(u.uVelocity, vel.read.attach(1));
      blit(vel.write); vel.swap();

      u = use(P.advect, simW, simH);
      gl.uniform2f(u.simTexel, 1 / simW, 1 / simH);
      gl.uniform1i(u.uVelocity, vel.read.attach(0)); gl.uniform1i(u.uSource, vel.read.attach(0));
      gl.uniform1f(u.dt, dt); gl.uniform1f(u.dissipation, .25);
      blit(vel.write); vel.swap();

      use(P.advect, dye.write.w, dye.write.h);
      gl.uniform1i(u.uVelocity, vel.read.attach(0)); gl.uniform1i(u.uSource, dye.read.attach(1));
      gl.uniform1f(u.dissipation, 1.1);
      blit(dye.write); dye.swap();

      u = use(P.display, dye.read.w, dye.read.h);
      gl.uniform1i(u.uTexture, dye.read.attach(0));
      blit(null);
    };

    // palette du site : teal → indigo, en intensité faible pour que les chiffres restent lisibles
    var PAL = [[.2, .83, .76], [.54, .61, 1], [.35, .72, .9]];
    var tint = function (k) { var c = PAL[Math.floor(Math.random() * PAL.length)]; return [c[0] * k, c[1] * k, c[2] * k]; };

    var visible = false, last = 0, lastAmbient = 0, px = -1, py = -1;
    var loop = function (t) {
      if (!visible || document.hidden) { last = 0; return; }
      var dt = last ? Math.min((t - last) / 1000, 1 / 30) : 1 / 60;
      last = t;
      // remous ambiant : la surface vit aussi sur mobile, sans pointeur
      if (t - lastAmbient > 2200) {
        lastAmbient = t;
        var a = rand(0, Math.PI * 2);
        splat(rand(.15, .85), rand(.15, .85), Math.cos(a) * 300, Math.sin(a) * 300, tint(.4), .004);
      }
      step(dt);
      requestAnimationFrame(loop);
    };

    if (finePointer) {
      sticky.addEventListener("pointermove", function (e) {
        var r = cv.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
        if (px >= 0) {
          var dx = (x - px) * 6000, dy = (y - py) * 6000;
          if (dx * dx + dy * dy > 1) splat(x, y, dx, dy, tint(.6));
        }
        px = x; py = y;
      });
      sticky.addEventListener("pointerleave", function () { px = py = -1; });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        var was = visible;
        visible = en[0].isIntersecting;
        if (visible && !was) requestAnimationFrame(loop);
      }).observe(sticky);
    }

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (!init()) cv.remove(); }, 200);
    });

    fluid = {
      // éclaboussure radiale au centre quand un nouveau chiffre arrive
      burst: function () {
        if (!visible) return;
        var n = 7, o = rand(0, Math.PI * 2);
        for (var i = 0; i < n; i++) {
          var a = o + i / n * Math.PI * 2;
          splat(.5 + Math.cos(a) * .03, .5 + Math.sin(a) * .05, Math.cos(a) * 1600, Math.sin(a) * 1600, tint(1), .003);
        }
      }
    };
  })();

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
  var lastNum = -1;
  var lastTb = -1;
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
      // hauteur visible de la barre : sert aux éléments collants (pipeline produit)
      var tb = topbar.classList.contains("hide") ? 0 : topbar.offsetHeight;
      if (tb !== lastTb) { root.style.setProperty("--tb", tb + "px"); lastTb = tb; }
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
      if (inView && idx !== lastNum && fluid) fluid.burst();
      lastNum = inView ? idx : -1;
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
    themeSet: "dark. always dark.", sections: "projects  product  incidents  parcours  stack  contact", secMap: { projects: "projets", product: "produit", timeline: "parcours", career: "parcours" }
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
    themeSet: "sombre. toujours sombre.", sections: "projets  produit  incidents  parcours  stack  contact", secMap: { projects: "projets", product: "produit", timeline: "parcours", career: "parcours" }
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
        if (!el || !/^(projets|produit|incidents|parcours|stack|contact|manifeste)$/.test(sec)) { print(S.usage + ": cd " + S.sections.split("  ").join(" | ")); break; }
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
      else if (parts[0] === "cd") { pool = ["projets", "produit", "incidents", "parcours", "stack", "contact"]; cur = parts[1]; }
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
