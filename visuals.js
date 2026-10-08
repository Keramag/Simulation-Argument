"use strict";

/* ---------- Atmospheric background (canvas) ----------
   Faint binary rain, grid, code fragments and glowing nodes. Density and hue
   evolve with argument progress p in [0,1]. Always dim: it must never compete
   with the content. */
const Background = (() => {
  const cv = document.getElementById("bg");
  const cx = cv.getContext("2d");
  const FRAGS = ["if (conscious(sim)) observers++;", "for (civ of universe) run(civ);", "P(sim) = f / (f + 1)",
    "while (alive) { simulate(ancestor); }", "assert(substrate.independent);", "fraction = N * fP * fI;",
    "// are you here?", "state = step(state, world);"];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, cols, drops, nodes, p = 0, target = 0, last = 0;

  function resize() {
    const d = devicePixelRatio || 1;
    W = innerWidth; H = innerHeight;
    cv.width = W * d; cv.height = H * d;
    cx.setTransform(d, 0, 0, d, 0, 0);
    cols = Math.ceil(W / 22);
    drops = Array.from({ length: cols }, () => Math.random() * H / 18);
    nodes = Array.from({ length: 26 }, () => ({ x: Math.random() * W, y: Math.random() * H, ph: Math.random() * 6.28, v: .15 + Math.random() * .3 }));
    draw(0);
  }

  function draw(t) {
    const hue = 185 + p * 85;                       // teal → violet as the argument deepens
    cx.clearRect(0, 0, W, H);
    cx.strokeStyle = `hsla(${hue},60%,60%,.035)`;
    cx.lineWidth = 1;
    for (let x = 0; x < W; x += 56) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, H); cx.stroke(); }
    for (let y = 0; y < H; y += 56) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke(); }

    cx.font = "14px ui-monospace, Menlo, monospace";
    const density = .25 + p * .55;                  // more rain as simulated observers multiply
    for (let i = 0; i < cols; i++) {
      if (i / cols > density) continue;
      const y = drops[i] * 18;
      cx.fillStyle = `hsla(${hue},70%,65%,.10)`;
      cx.fillText(Math.random() < .5 ? "0" : "1", i * 22, y);
      cx.fillStyle = `hsla(${hue},70%,65%,.04)`;
      cx.fillText(Math.random() < .5 ? "0" : "1", i * 22, y - 18);
      if (!reduce && (t - last > 0)) { drops[i] += .18 + (i % 5) * .03; if (y > H && Math.random() > .975) drops[i] = 0; }
    }

    cx.font = "12px ui-monospace, Menlo, monospace";
    cx.fillStyle = `hsla(${hue},50%,70%,.06)`;
    FRAGS.forEach((f, i) => cx.fillText(f, ((i * 211 + t * .004) % (W + 300)) - 300 + 20, 70 + (i * 97) % (H - 100)));

    const n = Math.round(6 + p * 20);
    for (let i = 0; i < n; i++) {
      const a = nodes[i], g = .5 + .5 * Math.sin(t * .0012 * a.v * 4 + a.ph);
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 190) { cx.strokeStyle = `hsla(${hue},70%,65%,${.07 * (1 - d / 190)})`; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }
      }
      const gr = cx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 14);
      gr.addColorStop(0, `hsla(${hue},80%,70%,${.35 * g})`); gr.addColorStop(1, "transparent");
      cx.fillStyle = gr; cx.beginPath(); cx.arc(a.x, a.y, 14, 0, 6.28); cx.fill();
    }
  }

  function loop(t) {
    p += (target - p) * .02;
    if (t - last > 50) { draw(t); last = t; }
    requestAnimationFrame(loop);
  }
  addEventListener("resize", resize);
  resize();
  if (!reduce) requestAnimationFrame(loop);
  return { set(v) { target = v; if (reduce) { p = v; draw(0); } } };
})();

/* ---------- Per-step diagrams ---------- */
const Visuals = (() => {
  const pickLabel = a => ({ agree: "yes", unsure: "unsure", disagree: "no" })[a];

  /* 1. Brain → computational model → simulated observer */
  function consciousness(a) {
    const state = a || "pending";
    const net = [[250, 70], [290, 40], [290, 100], [330, 70], [270, 70], [310, 70]];
    const links = [[0, 1], [0, 2], [1, 3], [2, 3], [0, 4], [4, 5], [5, 3], [1, 5], [2, 4]];
    return `<svg viewBox="0 0 560 140" class="dg c-${state}" role="img" aria-label="A human brain is copied into a computational model, producing a simulated observer">
      <g class="brain"><path d="M60 70c-20-5-22-35 0-38 4-18 30-20 38-5 14-8 32 4 26 20 16 6 12 32-4 34-6 14-24 14-30 4-8 8-26 2-30-15z" /><path d="M72 58c10 8 18-8 30 2M70 80c12-8 20 6 34-2" class="fold"/></g>
      <path class="flow" d="M135 70H230"/><path class="flow" d="M345 70H420"/>
      <circle class="pulse" r="4"><animateMotion dur="2.2s" repeatCount="indefinite" path="M135 70H230"/></circle>
      <circle class="pulse" r="4"><animateMotion dur="2.2s" begin=".7s" repeatCount="indefinite" path="M135 70H230"/></circle>
      <circle class="pulse p2" r="4"><animateMotion dur="2.2s" begin="1s" repeatCount="indefinite" path="M345 70H420"/></circle>
      <g class="model">${links.map(([i, j]) => `<line x1="${net[i][0]}" y1="${net[i][1]}" x2="${net[j][0]}" y2="${net[j][1]}"/>`).join("")}${net.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5" style="animation-delay:${i * .25}s"/>`).join("")}</g>
      <g class="sim-person"><circle cx="470" cy="45" r="14"/><path d="M445 105c0-30 50-30 50 0z"/><circle class="aura" cx="470" cy="70" r="46"/></g>
      <text x="100" y="132">human brain</text><text x="290" y="132">computational model</text><text x="470" y="132">${state === "disagree" ? "nobody home" : state === "pending" ? "conscious?" : "conscious?"}</text>
    </svg>`;
  }

  /* 2. Civilization → technological development → posthuman, with collapse points */
  function survival(a) {
    const n = 10, stops = a === "agree" ? 3 : a === "unsure" ? 1 : 0;  // lanes surviving to the end
    const marks = [28, 46, 62, 80];                                       // collapse points (% of track)
    const lanes = Array.from({ length: n }, (_, i) => {
      const lives = i < stops;
      const stop = lives ? 100 : marks[(i * 7 + 1) % marks.length] + ((i * 3) % 5);
      return `<div class="lane"><i class="trav ${lives ? "ok" : "die"}" style="--stop:${stop}%;--d:${(1.4 + i * .14).toFixed(2)}s"></i>${lives ? "" : `<b class="x" style="left:${stop}%;animation-delay:${(1.4 + i * .14).toFixed(2)}s">✕</b>`}</div>`;
    }).join("");
    return `<div class="dg timeline t-${a || "pending"}" role="img" aria-label="Ten civilizations travel toward the posthuman stage; some collapse along the way">
      <div class="tl-head"><span>Civilization</span><span>Technological development</span><span>Posthuman</span></div>
      <div class="tl-track">${lanes}</div>
      <div class="tl-note">${a ? `${stops} of ${n} reach the posthuman stage` : "How many make it?"}</div>
    </div>`;
  }

  /* 3. One civilization branching into many simulated worlds */
  function branching(a) {
    const count = a === "agree" ? 8 : a === "unsure" ? 3 : 0;
    const ghost = a ? 0 : 3;
    const total = Math.max(count, ghost), xs = i => 40 + (i + .5) * (480 / Math.max(total, 1));
    const lines = Array.from({ length: total }, (_, i) => `<path class="branch ${count ? "" : "ghost"}" style="animation-delay:${i * .12}s" d="M280 44C280 80 ${xs(i)} 70 ${xs(i)} 104"/>`).join("");
    const sims = Array.from({ length: total }, (_, i) => `<g class="simw ${count ? "" : "ghost"}" style="animation-delay:${.4 + i * .12}s"><rect x="${xs(i) - 22}" y="104" width="44" height="26" rx="5"/><text x="${xs(i)}" y="121">${count ? "sim " + (i + 1) : "?"}</text></g>`).join("");
    return `<svg viewBox="0 0 560 150" class="dg" role="img" aria-label="One civilization branching into simulated worlds">
      <g class="orig"><rect x="215" y="14" width="130" height="30" rx="6"/><text x="280" y="34">Original civilization</text></g>
      ${lines}${sims}
      ${a === "disagree" ? `<text x="280" y="100" class="none">no simulations are created</text>` : count && count < 8 ? "" : count ? `<text x="545" y="121" class="dots">…</text>` : ""}
    </svg>`;
  }

  /* 4/5. Field of observers: a handful of biological dots among many simulated ones */
  function field(p, opts = {}) {
    const BIO = 3, MAX = 420;
    const x = p ? p.fP * p.fI * p.N * p.c : 0;
    const sims = p ? Math.round(Math.min(MAX, BIO * x)) : 0;
    const total = BIO + sims;
    const bioAt = new Set();
    for (let k = 0; k < BIO; k++) bioAt.add(Math.floor((k + .5) * total / BIO * ((k * 7 % 5 + 8) / 10) ) % total);
    for (let i = 0; bioAt.size < BIO; i++) bioAt.add(i);   // top up if placements collided
    const youIdx = opts.you ? (opts.you === "sim" && sims ? [...Array(total).keys()].find(i => !bioAt.has(i) && i > total * .45) : [...bioAt][0]) : -1;
    const dots = Array.from({ length: total }, (_, i) => {
      const bio = bioAt.has(i);
      return `<i class="d ${bio ? "bio" : "sim"}${i === youIdx ? " you" : ""}" style="animation-delay:${bio ? 0 : Math.min(1.6, i * .004).toFixed(3)}s"></i>`;
    }).join("");
    const ratio = !p ? "" : x >= 1000 ? `${Math.round(x).toLocaleString()} : 1` : x >= 1 ? `${x.toFixed(1)} : 1` : "fewer than one";
    return `<div class="dg field">
      <div class="field-dots">${dots}</div>
      <div class="legend"><span><i class="d bio"></i> biological observers</span><span><i class="d sim"></i> simulated observers</span>${opts.you ? `<span><i class="d you"></i> most likely you</span>` : ""}
        <span class="ratio">${p ? `simulated : biological ≈ ${ratio}` : ""}</span></div>
      <div class="field-note">${sims >= MAX ? "Not to scale: the dots are capped, the real ratio would be far larger." : sims === 0 && p ? "On your numbers, simulated observers are rare." : ""}</div>
    </div>`;
  }

  return {
    diagram(key, ans, params, partial) {
      if (key === "c") return consciousness(ans.c);
      if (key === "fP") return survival(ans.fP);
      if (key === "fI") return branching(ans.fI);
      if (key === "N") return field(partial ? params : null);
      return field(params, { you: params && params.c * params.fP * params.fI * params.N > 1 ? "sim" : "bio" });
    },
    field,
    pickLabel,
  };
})();
