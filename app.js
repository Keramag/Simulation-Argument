"use strict";

/* ---------- Model ----------
   Bostrom's core fraction:  f_sim = (f_P * f_I * N) / (f_P * f_I * N + 1)
   f_P = fraction of civilizations that reach a posthuman stage
   f_I = fraction of those that run many ancestor simulations
   N   = average number of simulated histories per such civilization
   scaled by c, your credence that simulated minds can be conscious.
   Each answer chooses an illustrative value (VALUES, in content.js). */

const COMMIT = {
  agree: {
    c: "You accept the foundation: simulated minds could count as observers.",
    fP: "You think some civilizations make it. That closes off option A.",
    fI: "You think simulating is at least fairly common among those who can. That weakens option B.",
    N: "Multiplication does the rest: simulated lives can dwarf biological ones.",
    self: "This is the step that turns a statistic into a claim about you.",
  },
  disagree: {
    c: "This steps outside the trilemma: Bostrom assumes it rather than proves it.",
    fP: "This commits you to option A: civilizations almost never reach the posthuman stage.",
    fI: "This commits you to option B: posthuman civilizations almost never run many simulations.",
    N: "This leans on option B: simulations may exist, but not in numbers that matter.",
    self: "You decline to apply the statistic to yourself. Be ready to say what evidence separates you from a simulated person who would say the same.",
  },
};

const KEY = "simarg.v2";
let state = { answers: {}, objection: {}, step: -1, custom: null };
try { Object.assign(state, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
let ui = { open: null, other: false };

const core = ["c", "fP", "fI", "N"];
const complete = () => core.every(k => state.answers[k]);
const paramsFrom = a => Object.fromEntries(core.map(k => [k, VALUES[k][a[k]]]));
function compute(p) { const x = p.fP * p.fI * p.N; return { x, fsim: p.c * (x / (x + 1)) }; }
function classify(p) {
  const { x } = compute(p);
  if (p.c < 0.1) return "noSim";
  if (x >= 10 && p.c >= 0.5) return "C";
  if (x < 0.1) return p.fP < 1e-3 ? "A" : "B";
  return "mixed";
}
function pct(f) {
  if (f >= 0.9999) return ">99.99%";
  if (f < 0.0001) return "<0.01%";
  const v = f * 100;
  return (v >= 10 ? v.toFixed(0) : v.toFixed(1)) + "%";
}

const $ = id => document.getElementById(id);
const stage = $("stage");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const answered = s => !!state.answers[s.key];
const canContinue = s => answered(s) && (state.answers[s.key] === "agree" || !!state.objection[s.key]);

function go(step) {
  state.step = step; ui = { open: null, other: false }; save(); render();
  window.scrollTo({ top: 0 });
  stage.focus({ preventScroll: true });
}

function render() {
  renderGauge();
  Background.set(state.step < 0 ? 0 : Math.min(1, (state.step + 1) / (STEPS.length + 1)));
  if (state.step < 0) return renderIntro();
  if (state.step >= STEPS.length) return renderResult();
  renderStep(STEPS[state.step]);
}

function progressHTML() {
  const items = STEPS.map((s, i) => {
    const a = state.answers[s.key];
    const reach = i === 0 || canContinue(STEPS[i - 1]) || a;
    return `<button class="pd ${a || ""}${state.step === i ? " current" : ""}" data-i="${i}" ${reach ? "" : "disabled"} title="${esc(s.name)}"><span class="dot"></span><span class="pl">${esc(s.name)}</span></button>`;
  });
  const last = `<button class="pd${state.step >= STEPS.length ? " current" : ""}" data-i="${STEPS.length}" ${canContinue(STEPS[STEPS.length - 1]) ? "" : "disabled"} title="Trilemma"><span class="dot"></span><span class="pl">Trilemma</span></button>`;
  return `<nav class="progress" aria-label="Progress">${items.concat(last).join('<span class="bar"></span>')}</nav>`;
}
function wireProgress() {
  stage.querySelectorAll(".pd:not([disabled])").forEach(b => b.onclick = () => go(+b.dataset.i));
}

function renderGauge() {
  const g = $("gauge");
  if (!complete()) {
    const n = core.filter(k => state.answers[k]).length;
    g.innerHTML = `<div class="gauge-in">${n} of 4 premises weighed. Your running estimate appears once you've weighed all four.</div>`;
    return;
  }
  const { fsim } = compute(paramsFrom(state.answers));
  g.innerHTML = `<div class="gauge-in"><strong>On your answers, ${pct(fsim)} of observers like us are simulated.</strong>
    <div class="meter" role="img" aria-label="${pct(fsim)} simulated"><i style="width:${Math.max(fsim * 100, 0.5)}%"></i></div></div>`;
}

function renderIntro() {
  stage.innerHTML = `<section class="step">
    <div class="visual">${Visuals.field(null)}</div>
    <div class="card">
      <div class="tag">// an argument you complete yourself</div>
      <h1>Are you living in a simulation?</h1>
      <p>In 2003 the philosopher Nick Bostrom argued that at least one of three unlikely-sounding things is true. He did not say we are simulated. He said you cannot comfortably deny all three.</p>
      <p>I won't give you the conclusion. You'll decide, premise by premise, whether you accept each step, and watch the numbers underneath respond.</p>
      <p class="muted">Five questions. You can disagree, ask for the strongest objection, or hear the best case for the other side at any point.</p>
      <div class="row"><button class="btn" id="begin">Begin</button>${canContinue(STEPS[STEPS.length - 1]) ? '<button class="btn ghost" id="jump">Jump to my result</button>' : ""}</div>
    </div></section>`;
  $("begin").onclick = () => go(0);
  if ($("jump")) $("jump").onclick = () => go(STEPS.length);
}

function renderStep(s, keepVisual) {
  const ans = state.answers[s.key];
  const done = complete();
  const params = done ? paramsFrom(state.answers) : null;
  const diagram = keepVisual || Visuals.diagram(s.key, state.answers, params, done);
  const last = s.key === "self";
  const picked = state.objection[s.key];
  const aids = [["why", "Why?", s.why], ["deep", "Go deeper", s.deeper], ["obj", "Objection", s.objection]];

  let follow = "";
  if (ans === "agree") {
    follow = `<div class="reflect"><p>${esc(COMMIT.agree[s.key])}</p></div>`;
  } else if (ans) {
    const o = s.objections.find(o => o.id === picked);
    follow = `<div class="reflect"><div class="tag">// why don't you accept this premise?</div>
      <div class="objs">${s.objections.map(o => `<button class="obj${o.id === picked ? " sel" : ""}" data-o="${o.id}">${esc(o.label)}</button>`).join("")}</div>
      ${o ? `<div class="arg"><p><strong>The strongest version:</strong> ${esc(o.arg)}</p>${o.reply ? `<p class="muted"><strong>A defender replies:</strong> ${esc(o.reply)}</p>` : ""}
        <p class="commit">${ans === "unsure" ? "Recorded as a midpoint answer." : esc(COMMIT.disagree[s.key])}</p></div>` : ""}</div>`;
  }
  const other = ans ? (ans === "agree"
    ? { t: "The strongest case against", b: s.objection }
    : { t: "The strongest case for", b: s.forAgree }) : null;

  stage.innerHTML = `<section class="step">
    <div class="visual">${diagram}</div>
    <div class="card">
      <div class="tag">// ${esc(s.tag)}</div>
      <h2>${esc(s.q)}</h2>
      <p class="ctx">${esc(s.ctx)}</p>
      <div class="aids">${aids.map(([k, l]) => `<button class="aid${ui.open === k ? " on" : ""}" data-a="${k}">${l}</button>`).join("")}</div>
      ${ui.open ? `<div class="aidp">${esc(aids.find(a => a[0] === ui.open)[2])}</div>` : ""}
      <div class="choices" role="group" aria-label="Your answer">
        <button class="choice agree${ans === "agree" ? " sel" : ""}" data-k="agree" aria-pressed="${ans === "agree"}">I agree</button>
        <button class="choice disagree${ans && ans !== "agree" ? " sel" : ""}" data-k="disagree" aria-pressed="${!!ans && ans !== "agree"}">I disagree</button>
      </div>
      ${follow}
      ${other ? `<button class="link other" id="other">Show me the strongest argument for the other side</button>
        ${ui.other ? `<div class="aidp"><strong>${other.t}:</strong> ${esc(other.b)}</div>` : ""}` : ""}
      ${canContinue(s) ? `<div class="row"><button class="btn" id="next">${last ? "See the trilemma" : "Continue"}</button></div>` : ""}
      ${progressHTML()}
    </div></section>`;

  const keep = () => renderStep(s, stage.querySelector(".visual").innerHTML);   // toggles don't replay the diagram
  stage.querySelectorAll(".aid").forEach(b => b.onclick = () => { ui.open = ui.open === b.dataset.a ? null : b.dataset.a; keep(); });
  stage.querySelectorAll(".choice").forEach(b => b.onclick = () => {
    if (b.dataset.k === "agree") { state.answers[s.key] = "agree"; delete state.objection[s.key]; }
    else if (!ans || ans === "agree") { state.answers[s.key] = "disagree"; delete state.objection[s.key]; }
    state.custom = null; ui.other = false; save(); render();
  });
  stage.querySelectorAll(".obj").forEach(b => b.onclick = () => {
    state.objection[s.key] = b.dataset.o;
    state.answers[s.key] = b.dataset.o === "unsure" ? "unsure" : "disagree";
    state.custom = null; save(); render();
  });
  if ($("other")) $("other").onclick = () => { ui.other = !ui.other; keep(); };
  if ($("next")) $("next").onclick = () => go(state.step + 1);
  wireProgress();
}

const STATUS = {
  c: "Open: depends on which theory of consciousness is right.",
  fP: "Open: we can't yet tell whether the Great Filter is behind us or ahead.",
  fI: "Open: we cannot observe posthuman motives or ethics.",
  N: "Plausible on compute estimates, but real simulation costs are unknown.",
  self: "Contested: anthropic reasoning has well-known paradoxes.",
};

function renderResult() {
  const p = state.custom || paramsFrom(state.answers);
  const { fsim, x } = compute(p);
  const cls = classify(p);
  const self = state.answers.self;
  const yours = self === "agree"
    ? `Applying the indifference principle, your credence that you are simulated comes out at <strong>${pct(fsim)}</strong>.`
    : self === "unsure" ? `You're unsure the principle applies, so your credence lies somewhere between your prior and <strong>${pct(fsim)}</strong>.`
    : `You exempt yourself from the statistic, so your credence rests on whatever evidence you think distinguishes you, not on the <strong>${pct(fsim)}</strong> share.`;
  const verdicts = {
    noSim: "Your answer on consciousness sidesteps the trilemma: if simulated beings can't be conscious, there are no simulated observers to count. Bostrom assumes this rather than defends it.",
    A: "Your answers commit you to <strong>A</strong>: civilizations almost never reach the posthuman stage. Defending that means expecting that humanity probably won't last.",
    B: "Your answers commit you to <strong>B</strong>: posthuman civilizations almost never run enormous numbers of ancestor simulations. Defending that means expecting nearly every advanced mind to refrain, always.",
    C: "Your answers commit you to <strong>C</strong>: simulated observers vastly outnumber biological ones. If you accept the indifference step, you should take seriously that you are one of them.",
    mixed: "Your answers spread across the options. No branch clearly wins, so you're hedging between them, which is a legitimate place to stand.",
  };
  const rows = core.map(k => {
    const cells = ["agree", "unsure", "disagree"].map(opt => {
      const pp = { ...paramsFrom(state.answers) }; pp[k] = VALUES[k][opt];
      return `<td class="${state.answers[k] === opt && !state.custom ? "now" : ""}">${pct(compute(pp).fsim)}</td>`;
    }).join("");
    return `<tr><th scope="row">${esc(STEPS.find(s => s.key === k).name)}</th>${cells}</tr>`;
  }).join("");
  const accepted = STEPS.filter(s => state.answers[s.key] === "agree"), doubted = STEPS.filter(s => state.answers[s.key] !== "agree");
  const sl = (id, label, min, max, val, step) => `<label for="${id}">${label}: <span id="${id}-v"></span></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}">`;
  const youKind = x * p.c > 1 ? "sim" : "bio";

  stage.innerHTML = `<section class="step">
    <div class="visual" id="rf">${Visuals.field(p, { you: youKind })}</div>
    <div class="card">
      <div class="tag">// the trilemma</div>
      <h2>At least one of these is true</h2>
      <div class="trilemma">
        <div class="tcard A${cls === "A" ? " on" : ""}"><h3>A. The doom option</h3>Civilizations almost never reach the posthuman stage.</div>
        <div class="tcard B${cls === "B" ? " on" : ""}"><h3>B. The abstention option</h3>Posthuman civilizations almost never run enormous numbers of ancestor simulations.</div>
        <div class="tcard C${cls === "C" ? " on" : ""}"><h3>C. The simulation option</h3>Simulated observers vastly outnumber biological observers.</div>
      </div>
      <p id="verdict">${verdicts[cls]}</p>
      <div class="reflect"><div class="big" id="big">${pct(fsim)}</div>of observers are simulated. ${yours}</div>

      <h3>Two different questions</h3>
      <div class="two">
        <div class="pane"><div class="tag">// what follows logically</div>
          <p>${accepted.length ? `Taking as given: ${accepted.map(s => esc(s.name.toLowerCase())).join(", ")}.` : "You accepted none of the premises outright."} The calculation above is only as good as those assumptions. <em>If</em> they hold, the conclusion follows.</p></div>
        <div class="pane"><div class="tag">// whether it's actually true</div>
          ${doubted.length ? `<p>Where you doubted: ${doubted.map(s => `<strong>${esc(s.name)}</strong>`).join(", ")}.</p>` : ""}
          <ul>${STEPS.map(s => `<li><strong>${esc(s.name)}:</strong> ${esc(STATUS[s.key])}</li>`).join("")}</ul>
          <p>Nothing here shows that we live in a simulation. It shows what you must believe if you reject the claim.</p></div>
      </div>

      <h3>What would change it?</h3>
      <p class="muted">Share of simulated observers if you changed one answer and kept the rest.</p>
      <table><thead><tr><th></th><th>Agree</th><th>Not sure</th><th>Disagree</th></tr></thead><tbody>${rows}</tbody></table>

      <h3>Try your own numbers</h3>
      <div class="sliders">
        ${sl("s-c", "Chance simulated minds can be conscious (%)", 0, 100, Math.round(p.c * 100), 1)}
        ${sl("s-fP", "Civilizations reaching the posthuman stage (log₁₀)", -9, 0, Math.log10(p.fP).toFixed(1), 0.1)}
        ${sl("s-fI", "…of which run many simulations (log₁₀)", -9, 0, Math.log10(p.fI).toFixed(1), 0.1)}
        ${sl("s-N", "Simulated histories per such civilization (log₁₀)", -1, 9, Math.log10(p.N).toFixed(1), 0.1)}
      </div>
      <p class="muted" style="margin-top:24px">The argument doesn't need you to believe in simulations. It needs you to find a way to reject <em>all three</em> branches. Critics also challenge the hidden steps: substrate independence, indifference reasoning, and whether the simulations are feasible.</p>
      <div class="row"><button class="btn ghost" id="back">Revisit my answers</button><button class="btn ghost" id="again">Start over</button></div>
      ${progressHTML()}
    </div></section>`;

  const wire = () => {
    const read = id => +$(id).value;
    const q = { c: read("s-c") / 100, fP: 10 ** read("s-fP"), fI: 10 ** read("s-fI"), N: 10 ** read("s-N") };
    $("s-c-v").textContent = Math.round(q.c * 100) + "%";
    $("s-fP-v").textContent = q.fP < 0.001 ? q.fP.toExponential(1) : (q.fP * 100).toPrecision(2) + "%";
    $("s-fI-v").textContent = q.fI < 0.001 ? q.fI.toExponential(1) : (q.fI * 100).toPrecision(2) + "%";
    $("s-N-v").textContent = q.N >= 10 ? Math.round(q.N).toLocaleString() : q.N.toPrecision(2);
    return q;
  };
  wire();
  ["s-c", "s-fP", "s-fI", "s-N"].forEach(id => $(id).oninput = () => {
    const q = wire(); state.custom = q;
    const r = compute(q), c = classify(q);
    $("big").textContent = pct(r.fsim);
    $("verdict").innerHTML = verdicts[c];
    $("rf").innerHTML = Visuals.field(q, { you: r.x * q.c > 1 ? "sim" : "bio" });
    stage.querySelectorAll(".tcard").forEach(t => t.classList.toggle("on", t.classList.contains(c)));
    $("gauge").querySelector("strong").textContent = `On your adjusted numbers, ${pct(r.fsim)} of observers are simulated.`;
    $("gauge").querySelector("i").style.width = Math.max(r.fsim * 100, 0.5) + "%";
  });
  $("back").onclick = () => { state.custom = null; go(0); };
  $("again").onclick = reset;
  wireProgress();
}

function reset() {
  state = { answers: {}, objection: {}, step: -1, custom: null }; ui = { open: null, other: false };
  save(); render(); window.scrollTo({ top: 0 });
}
$("reset").onclick = reset;

if (state.step >= STEPS.length && !canContinue(STEPS[STEPS.length - 1])) state.step = -1;
render();
